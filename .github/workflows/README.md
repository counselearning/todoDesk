# GitHub Actions 工作流程

此資料夾包含 GitHub Actions 工作流程定義，用於自動化構建和部署。

## 可用的工作流程

### build-windows.yml
自動構建 Windows 11 版本的 TodoDesk 應用程式。

#### 觸發條件
- **Push**: 推送到 `main` 分支或 `claude/**` 分支時
- **Tags**: 創建以 `v` 開頭的標籤時（例如：v1.0.0）
- **Pull Request**: 對 `main` 分支的 PR
- **手動觸發**: 可在 GitHub Actions 頁面手動執行

#### 構建產物
工作流程會產生以下文件：
- `TodoDesk Setup x.x.x.exe` - NSIS 安裝程式（帶安裝嚮導）
- `TodoDesk x.x.x.exe` - 便攜版本（無需安裝）

#### 下載構建產物
1. 前往 GitHub 倉庫的 **Actions** 標籤
2. 選擇最新的成功構建
3. 在頁面底部的 **Artifacts** 區域下載：
   - `TodoDesk-Windows-Installer` - 安裝程式
   - `TodoDesk-Windows-Portable` - 便攜版

#### 產物保留期限
構建產物會保留 30 天。

## 手動觸發構建

1. 前往倉庫的 **Actions** 標籤
2. 選擇 **Build Windows 11** 工作流程
3. 點擊 **Run workflow** 按鈕
4. 選擇要構建的分支
5. 點擊綠色的 **Run workflow** 按鈕

## 發布新版本

要創建正式發布版本：

### 方法 1: 使用 Git 標籤
```bash
# 更新版本號
npm version patch  # 或 minor / major

# 推送標籤
git push --follow-tags
```

### 方法 2: 手動創建標籤
```bash
# 創建標籤
git tag v1.0.0

# 推送標籤
git push origin v1.0.0
```

當推送標籤後，GitHub Actions 會：
1. 自動構建應用程式
2. 創建 GitHub Release
3. 將構建產物附加到 Release

## 本地測試打包

在推送前，建議先在本地測試打包：

```bash
# 安裝依賴
npm install

# 構建並打包
npm run package:win
```

打包後的文件會在 `build` 資料夾中。

## 常見問題

### Q: 為什麼構建失敗？
A: 檢查以下幾點：
- TypeScript 編譯是否成功
- 所有依賴是否正確安裝
- `dist` 資料夾是否正確生成
- 查看 Actions 日誌獲取詳細錯誤信息

### Q: 如何查看構建日誌？
A:
1. 前往 **Actions** 標籤
2. 點擊相應的工作流程執行
3. 點擊 **build** 作業
4. 展開各個步驟查看詳細日誌

### Q: 構建很慢怎麼辦？
A:
- Windows runner 的構建通常需要 5-15 分鐘
- 可以啟用快取來加速（workflow 已配置 npm 快取）
- Electron 下載可能需要較長時間

### Q: 如何添加代碼簽名？
A:
1. 獲取代碼簽名證書
2. 在 GitHub 倉庫設定中添加 Secrets：
   - `CSC_LINK`: 證書文件（base64 編碼）
   - `CSC_KEY_PASSWORD`: 證書密碼
3. 更新 `package.json` 中的簽名配置

### Q: 可以同時構建多個平台嗎？
A: 可以！創建類似的工作流程文件：
- `build-macos.yml` - macOS 構建（使用 `macos-latest`）
- `build-linux.yml` - Linux 構建（使用 `ubuntu-latest`）

## 擴展工作流程

### 添加自動測試
在構建前添加測試步驟：

```yaml
- name: Run tests
  run: npm test
```

### 添加 linting
```yaml
- name: Run linter
  run: npm run lint
```

### 發送通知
使用 Slack/Discord/Email actions 在構建完成時發送通知。

## 相關資源

- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Electron Builder 文檔](https://www.electron.build/)
- [工作流程語法](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
