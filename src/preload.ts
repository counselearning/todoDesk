import { contextBridge, ipcRenderer } from 'electron';
import { TodoItem, FileTodos } from './types';

// 暴露安全的 API 給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  // 選擇資料夾
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // 掃描資料夾
  scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan-directory', dirPath),

  // 更新 todo 狀態
  updateTodoStatus: (todo: TodoItem, completed: boolean) =>
    ipcRenderer.invoke('update-todo-status', todo, completed),

  // 更新 todo 文字
  updateTodoText: (todo: TodoItem, newText: string) =>
    ipcRenderer.invoke('update-todo-text', todo, newText),

  // 獲取當前目錄
  getCurrentDirectory: () => ipcRenderer.invoke('get-current-directory'),

  // 監聽 todos 更新
  onTodosUpdated: (callback: (todos: FileTodos[]) => void) => {
    ipcRenderer.on('todos-updated', (event, todos) => callback(todos));
  }
});

// 類型聲明
declare global {
  interface Window {
    electronAPI: {
      selectDirectory: () => Promise<string | null>;
      scanDirectory: (dirPath: string) => Promise<{ success: boolean; data?: FileTodos[]; error?: string }>;
      updateTodoStatus: (todo: TodoItem, completed: boolean) => Promise<{ success: boolean; error?: string }>;
      updateTodoText: (todo: TodoItem, newText: string) => Promise<{ success: boolean; error?: string }>;
      getCurrentDirectory: () => Promise<string | null>;
      onTodosUpdated: (callback: (todos: FileTodos[]) => void) => void;
    };
  }
}
