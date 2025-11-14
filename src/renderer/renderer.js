// 全域變數
let allTodos = [];
let currentDirectory = null;
let editingTodo = null;

// DOM 元素
const selectDirBtn = document.getElementById('selectDirBtn');
const refreshBtn = document.getElementById('refreshBtn');
const dirPath = document.getElementById('dirPath');
const todosList = document.getElementById('todosList');
const searchInput = document.getElementById('searchInput');
const filterCompleted = document.getElementById('filterCompleted');
const filterIncomplete = document.getElementById('filterIncomplete');
const sortBy = document.getElementById('sortBy');
const editModal = document.getElementById('editModal');
const editText = document.getElementById('editText');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// 初始化
async function init() {
  // 檢查是否有之前選擇的資料夾
  currentDirectory = await window.electronAPI.getCurrentDirectory();
  if (currentDirectory) {
    dirPath.textContent = currentDirectory;
    await loadTodos();
  }

  // 監聽按鈕事件
  selectDirBtn.addEventListener('click', handleSelectDirectory);
  refreshBtn.addEventListener('click', handleRefresh);
  searchInput.addEventListener('input', handleFilter);
  filterCompleted.addEventListener('change', handleFilter);
  filterIncomplete.addEventListener('change', handleFilter);
  sortBy.addEventListener('change', handleFilter);
  saveEditBtn.addEventListener('click', handleSaveEdit);
  cancelEditBtn.addEventListener('click', handleCancelEdit);

  // 監聽關閉對話框
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      handleCancelEdit();
    }
  });

  // 監聽 todos 更新
  window.electronAPI.onTodosUpdated((todos) => {
    allTodos = todos;
    renderTodos();
  });
}

// 選擇資料夾
async function handleSelectDirectory() {
  const dir = await window.electronAPI.selectDirectory();
  if (dir) {
    currentDirectory = dir;
    dirPath.textContent = dir;
    await loadTodos();
  }
}

// 載入 todos
async function loadTodos() {
  if (!currentDirectory) return;

  const result = await window.electronAPI.scanDirectory(currentDirectory);
  if (result.success) {
    allTodos = result.data || [];
    renderTodos();
  } else {
    console.error('載入 todos 失敗:', result.error);
    showError('載入 todos 失敗');
  }
}

// 重新整理
async function handleRefresh() {
  await loadTodos();
}

// 過濾和排序
function handleFilter() {
  renderTodos();
}

// 渲染 todos
function renderTodos() {
  if (!allTodos || allTodos.length === 0) {
    todosList.innerHTML = '<div class="empty-state"><p>📭 在此資料夾中沒有找到 todos</p></div>';
    updateStats([]);
    return;
  }

  // 收集所有 todos
  let todos = [];
  allTodos.forEach(fileTodos => {
    fileTodos.todos.forEach(todo => {
      todos.push({
        ...todo,
        fileName: fileTodos.fileName
      });
    });
  });

  // 過濾
  const searchTerm = searchInput.value.toLowerCase();
  const showCompleted = filterCompleted.checked;
  const showIncomplete = filterIncomplete.checked;

  todos = todos.filter(todo => {
    // 狀態過濾
    if (!showCompleted && todo.completed) return false;
    if (!showIncomplete && !todo.completed) return false;

    // 搜尋過濾
    if (searchTerm) {
      const matchText = todo.text.toLowerCase().includes(searchTerm);
      const matchTags = todo.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      const matchFile = todo.fileName.toLowerCase().includes(searchTerm);
      return matchText || matchTags || matchFile;
    }

    return true;
  });

  // 排序
  const sortOption = sortBy.value;
  todos.sort((a, b) => {
    switch (sortOption) {
      case 'date':
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      case 'file':
        return a.filePath.localeCompare(b.filePath);
      case 'status':
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      default:
        return 0;
    }
  });

  // 按檔案分組
  const groupedByFile = {};
  todos.forEach(todo => {
    if (!groupedByFile[todo.filePath]) {
      groupedByFile[todo.filePath] = {
        fileName: todo.fileName,
        filePath: todo.filePath,
        todos: []
      };
    }
    groupedByFile[todo.filePath].todos.push(todo);
  });

  // 渲染
  let html = '';
  Object.values(groupedByFile).forEach(fileGroup => {
    html += renderFileGroup(fileGroup);
  });

  todosList.innerHTML = html || '<div class="empty-state"><p>😊 沒有符合條件的 todos</p></div>';

  // 綁定事件
  bindTodoEvents();

  // 更新統計
  updateStats(todos);
}

// 渲染檔案分組
function renderFileGroup(fileGroup) {
  const { fileName, filePath, todos } = fileGroup;

  let html = `
    <div class="file-group">
      <div class="file-header">
        <span class="file-name">📄 ${escapeHtml(fileName)}</span>
        <span class="file-path">${escapeHtml(filePath)}</span>
        <span class="file-count">${todos.length}</span>
      </div>
      <div class="file-todos">
  `;

  todos.forEach(todo => {
    html += renderTodoItem(todo);
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

// 渲染單個 todo 項目
function renderTodoItem(todo) {
  const isOverdue = todo.date && new Date(todo.date) < new Date() && !todo.completed;

  return `
    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}">
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
      <div class="todo-content">
        <div class="todo-text">${escapeHtml(todo.text)}</div>
        <div class="todo-meta">
          ${todo.tags.map(tag => `<span class="todo-tag">#${escapeHtml(tag)}</span>`).join('')}
          ${todo.date ? `<span class="todo-date ${isOverdue ? 'overdue' : ''}">📅 ${todo.date}</span>` : ''}
          <span class="todo-location">📍 Line ${todo.lineNumber}</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="icon-btn edit-btn" title="編輯">✏️</button>
      </div>
    </div>
  `;
}

// 綁定 todo 事件
function bindTodoEvents() {
  // Checkbox 事件
  document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleToggleTodo);
  });

  // 編輯按鈕事件
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handleEditTodo);
  });
}

// 切換 todo 狀態
async function handleToggleTodo(e) {
  const todoElement = e.target.closest('.todo-item');
  const todoId = todoElement.dataset.todoId;
  const todo = findTodoById(todoId);

  if (todo) {
    const newStatus = e.target.checked;
    const result = await window.electronAPI.updateTodoStatus(todo, newStatus);

    if (!result.success) {
      console.error('更新 todo 狀態失敗');
      e.target.checked = !newStatus; // 還原
    }
  }
}

// 編輯 todo
function handleEditTodo(e) {
  const todoElement = e.target.closest('.todo-item');
  const todoId = todoElement.dataset.todoId;
  editingTodo = findTodoById(todoId);

  if (editingTodo) {
    editText.value = editingTodo.text;
    editModal.classList.add('active');
    editText.focus();
  }
}

// 儲存編輯
async function handleSaveEdit() {
  if (!editingTodo) return;

  const newText = editText.value.trim();
  if (!newText) {
    alert('請輸入 todo 內容');
    return;
  }

  const result = await window.electronAPI.updateTodoText(editingTodo, newText);

  if (result.success) {
    editModal.classList.remove('active');
    editingTodo = null;
  } else {
    alert('儲存失敗');
  }
}

// 取消編輯
function handleCancelEdit() {
  editModal.classList.remove('active');
  editingTodo = null;
}

// 更新統計
function updateStats(todos) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const incomplete = total - completed;
  const overdue = todos.filter(t => t.date && new Date(t.date) < new Date() && !t.completed).length;

  document.getElementById('totalTodos').textContent = total;
  document.getElementById('completedTodos').textContent = completed;
  document.getElementById('incompleteTodos').textContent = incomplete;
  document.getElementById('overdueTodos').textContent = overdue;
}

// 查找 todo
function findTodoById(id) {
  for (const fileTodos of allTodos) {
    const todo = fileTodos.todos.find(t => t.id === id);
    if (todo) return todo;
  }
  return null;
}

// 顯示錯誤
function showError(message) {
  todosList.innerHTML = `<div class="empty-state"><p>❌ ${escapeHtml(message)}</p></div>`;
}

// HTML 轉義
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 啟動
init();
