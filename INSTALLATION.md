# TodoDesk 安裝指南

## 環境需求

- Node.js 18 或更高版本
- npm 或 yarn 包管理器

## 安裝步驟

### 1. 安裝 Node.js 依賴

```bash
npm install
```

如果遇到 Electron 下載問題，可以嘗試：

#### 選項 A: 使用淘寶鏡像（中國地區）

```bash
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm install
```

#### 選項 B: 使用代理

```bash
npm config set proxy http://your-proxy:port
npm install
```

#### 選項 C: 離線安裝

1. 手動下載 Electron 二進制文件
2. 設置環境變數：
   ```bash
   export ELECTRON_SKIP_BINARY_DOWNLOAD=1
   npm install
   ```
3. 將下載的 Electron 放到正確位置

### 2. 編譯 TypeScript

```bash
npm run build
```

這將把 `src` 目錄下的 TypeScript 文件編譯到 `dist` 目錄。

### 3. 啟動應用

```bash
npm start
```

## 開發模式

如果你想要在開發時自動重新編譯：

```bash
npm run dev
```

這會：
1. 啟動 TypeScript 監聽模式
2. 自動重新編譯變更的文件
3. 啟動 Electron 應用

## 打包應用

要創建可分發的應用程式：

```bash
npm run package
```

打包後的文件會在 `build` 資料夾中，根據你的作業系統會生成對應的安裝包：
- Windows: `.exe` 安裝程式
- macOS: `.dmg` 映像檔
- Linux: `.AppImage` 或 `.deb`

## 故障排除

### Electron 安裝失敗

如果 Electron 安裝總是失敗：

1. **清除快取**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **檢查網路連接**
   - 確保能訪問 GitHub 和 npm registry
   - 檢查防火牆設置

3. **手動安裝 Electron**
   ```bash
   npm install electron@28.0.0 --save-dev --force
   ```

### TypeScript 編譯錯誤

如果遇到 TypeScript 編譯錯誤：

```bash
# 重新安裝 TypeScript
npm install typescript@latest --save-dev

# 清除並重新編譯
rm -rf dist
npm run build
```

### 應用無法啟動

1. 確認 `dist` 資料夾存在且有編譯後的文件
2. 檢查 `dist/main.js` 是否存在
3. 查看終端機的錯誤訊息

## 測試應用

安裝完成後，你可以使用專案中的範例文件測試：

1. 啟動應用
2. 點擊「選擇資料夾」
3. 選擇 `examples` 資料夾
4. 你應該會看到兩個範例 Markdown 文件中的 todos

## 文件結構說明

```
todoDesk/
├── src/                    # 源代碼
│   ├── main.ts            # Electron 主進程（後端）
│   ├── preload.ts         # 安全橋接層
│   ├── parser.ts          # Markdown 解析邏輯
│   ├── types.ts           # TypeScript 類型定義
│   └── renderer/          # 渲染進程（前端）
│       ├── index.html     # 主頁面
│       ├── styles.css     # 樣式
│       └── renderer.js    # 前端邏輯
├── dist/                   # 編譯輸出（執行文件）
├── examples/               # 示例 Markdown 文件
├── node_modules/           # 依賴包
└── build/                  # 打包輸出（安裝程式）
```

## 常見問題

### Q: 為什麼我的 todos 沒有顯示？

A: 檢查以下幾點：
- Markdown 文件是否使用正確的格式 `- [ ]` 或 `- [x]`
- 文件副檔名是否為 `.md`
- 是否選擇了正確的資料夾

### Q: 我可以同時監聽多個資料夾嗎？

A: 目前版本只支援單一資料夾，但會遞迴掃描子資料夾中的所有 Markdown 文件。

### Q: 編輯後為什麼沒有立即更新？

A: 如果你在外部編輯器修改文件，應該會在保存後自動更新。如果沒有，請點擊「重新整理」按鈕。

### Q: 支援哪些作業系統？

A:
- ✅ Windows 10/11
- ✅ macOS 10.13+
- ✅ Linux (主流發行版)

## 獲取幫助

如果遇到其他問題：
1. 查看 README.md 了解功能說明
2. 檢查 GitHub Issues
3. 提交新的 Issue 描述你的問題
