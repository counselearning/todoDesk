# TodoDesk - Markdown Todo Dashboard

一個桌面應用程式，可以讀取資料夾中的 Markdown 檔案，將不同檔案間的 todo 彙總成儀表板畫面，並透過此工具編輯 todos。

![TodoDesk](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特點

- 📁 **掃描資料夾** - 自動掃描選定資料夾中的所有 Markdown 檔案
- 📋 **彙總顯示** - 將所有 todos 集中在一個儀表板中顯示
- ✅ **狀態管理** - 直接在界面上勾選/取消勾選 todo 項目
- ✏️ **即時編輯** - 編輯 todo 文字內容
- 🔍 **搜尋過濾** - 根據關鍵字、標籤、狀態過濾 todos
- 📊 **統計資訊** - 顯示總計、已完成、未完成、已逾期的 todos 數量
- 🔄 **自動同步** - 監聽檔案變化，自動更新顯示
- 🏷️ **標籤支援** - 支援 `#tag` 格式的標籤
- 📅 **日期支援** - 支援 `📅 YYYY-MM-DD` 格式的日期，並標示逾期項目

## 📝 支援的 Markdown 格式

TodoDesk 支援標準的 Markdown checkbox 格式：

```markdown
- [ ] 購買立板 #td 📅 2025-11-13
- [x] 製作成果 #td 📅 2025-11-25
- [ ] #td 修改立板的日期（黏貼）📅 2025-11-17
```

格式說明：
- `- [ ]` 表示未完成的 todo
- `- [x]` 表示已完成的 todo
- `#標籤` 可以添加標籤（如 #td、#work、#home）
- `📅 YYYY-MM-DD` 添加日期

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 編譯 TypeScript

```bash
npm run build
```

### 啟動應用

```bash
npm start
```

### 開發模式

```bash
npm run dev
```

## 🎯 使用方法

1. **選擇資料夾**
   - 點擊「📁 選擇資料夾」按鈕
   - 選擇包含 Markdown 檔案的資料夾
   - 應用會自動掃描並顯示所有 todos

2. **查看 Todos**
   - 所有 todos 按檔案分組顯示
   - 可以看到每個 todo 的標籤、日期和位置

3. **編輯 Todos**
   - 點擊 checkbox 可以切換完成狀態
   - 點擊「✏️」按鈕可以編輯文字內容
   - 變更會直接寫回原始 Markdown 檔案

4. **過濾和搜尋**
   - 使用搜尋框搜尋關鍵字
   - 切換「顯示已完成」/「顯示未完成」來過濾
   - 選擇排序方式（依日期、檔案、狀態）

5. **自動同步**
   - 當 Markdown 檔案在外部編輯器中修改時
   - TodoDesk 會自動偵測並更新顯示

## 📦 打包應用

### 本地打包

打包為可執行檔：

```bash
# 打包所有平台
npm run package

# 只打包 Windows
npm run package:win

# 只打包 macOS
npm run package:mac

# 只打包 Linux
npm run package:linux
```

打包後的檔案會在 `build` 資料夾中。

### GitHub Actions 自動構建

本專案已配置 GitHub Actions 自動構建 Windows 11 版本。

#### 自動觸發構建
- 推送到 `main` 或 `claude/**` 分支
- 創建 Pull Request
- 創建版本標籤（如 `v1.0.0`）

#### 手動觸發構建
1. 前往 GitHub 倉庫的 **Actions** 標籤
2. 選擇 **Build Windows 11** 工作流程
3. 點擊 **Run workflow** 選擇分支並執行

#### 下載構建產物
1. 前往 **Actions** 標籤
2. 選擇成功的構建
3. 在 **Artifacts** 區域下載：
   - `TodoDesk-Windows-Installer` - 安裝程式 (.exe)
   - `TodoDesk-Windows-Portable` - 便攜版

#### 發布正式版本
```bash
# 更新版本並創建標籤
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 推送標籤（會自動觸發構建和發布）
git push --follow-tags
```

推送標籤後，GitHub Actions 會自動創建 Release 並附加安裝程式。

詳細說明請參考 [.github/workflows/README.md](.github/workflows/README.md)

## 🛠️ 技術架構

- **Electron** - 桌面應用框架
- **TypeScript** - 類型安全的 JavaScript
- **Chokidar** - 檔案監聽
- **純 HTML/CSS/JavaScript** - 輕量化的前端界面

## 📁 專案結構

```
todoDesk/
├── src/
│   ├── main.ts           # Electron 主進程
│   ├── preload.ts        # 預載腳本
│   ├── parser.ts         # Markdown 解析器
│   ├── types.ts          # TypeScript 類型定義
│   └── renderer/         # 渲染進程（前端）
│       ├── index.html    # 主頁面
│       ├── styles.css    # 樣式表
│       └── renderer.js   # 前端邏輯
├── dist/                 # 編譯輸出
├── build/                # 打包輸出
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 配置說明

### package.json 腳本

- `npm start` - 啟動應用
- `npm run dev` - 開發模式（自動重新編譯）
- `npm run build` - 編譯 TypeScript
- `npm run build:watch` - 監聽模式編譯
- `npm run package` - 打包應用

## 🐛 已知問題

- 如果 Markdown 檔案格式不正確，可能無法正確解析
- 大型資料夾（數千個檔案）可能需要較長載入時間

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📮 聯絡方式

如有問題或建議，請提交 Issue。
