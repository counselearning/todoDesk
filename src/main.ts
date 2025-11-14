import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { MarkdownTodoParser } from './parser';
import { FileTodos, TodoItem } from './types';

class TodoDeskApp {
  private mainWindow: BrowserWindow | null = null;
  private parser: MarkdownTodoParser;
  private watcher: chokidar.FSWatcher | null = null;
  private currentDirectory: string | null = null;

  constructor() {
    this.parser = new MarkdownTodoParser();
    this.initializeApp();
  }

  private initializeApp(): void {
    // 當 Electron 初始化完成後創建視窗
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIpcHandlers();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    // 當所有視窗都關閉時退出應用（macOS 除外）
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      },
      title: 'TodoDesk - Markdown Todo Dashboard'
    });

    // 載入 HTML 檔案
    this.mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));

    // 開發模式下打開開發者工具
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIpcHandlers(): void {
    // 選擇資料夾
    ipcMain.handle('select-directory', async () => {
      if (!this.mainWindow) return null;

      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      const dirPath = result.filePaths[0];
      this.currentDirectory = dirPath;

      // 開始監聽資料夾
      this.watchDirectory(dirPath);

      return dirPath;
    });

    // 掃描資料夾
    ipcMain.handle('scan-directory', async (event, dirPath: string) => {
      try {
        const results = this.parser.scanDirectory(dirPath);
        return { success: true, data: results };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    });

    // 更新 todo 狀態
    ipcMain.handle('update-todo-status', async (event, todo: TodoItem, completed: boolean) => {
      try {
        const success = this.parser.updateTodoStatus(todo, completed);
        if (success && this.currentDirectory) {
          // 重新掃描並通知前端
          const results = this.parser.scanDirectory(this.currentDirectory);
          this.mainWindow?.webContents.send('todos-updated', results);
        }
        return { success };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    });

    // 更新 todo 文字
    ipcMain.handle('update-todo-text', async (event, todo: TodoItem, newText: string) => {
      try {
        const success = this.parser.updateTodoText(todo, newText);
        if (success && this.currentDirectory) {
          // 重新掃描並通知前端
          const results = this.parser.scanDirectory(this.currentDirectory);
          this.mainWindow?.webContents.send('todos-updated', results);
        }
        return { success };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    });

    // 獲取當前監聽的資料夾
    ipcMain.handle('get-current-directory', async () => {
      return this.currentDirectory;
    });
  }

  private watchDirectory(dirPath: string): void {
    // 停止之前的監聽
    if (this.watcher) {
      this.watcher.close();
    }

    // 監聽 markdown 檔案的變化
    this.watcher = chokidar.watch(`${dirPath}/**/*.md`, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('add', () => this.onFileChange())
      .on('change', () => this.onFileChange())
      .on('unlink', () => this.onFileChange());
  }

  private onFileChange(): void {
    if (this.currentDirectory && this.mainWindow) {
      const results = this.parser.scanDirectory(this.currentDirectory);
      this.mainWindow.webContents.send('todos-updated', results);
    }
  }
}

// 啟動應用
new TodoDeskApp();
