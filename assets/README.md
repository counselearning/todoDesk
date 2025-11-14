# 應用圖標

此資料夾用於存放應用程式圖標。

> **注意**: 圖標是可選的。目前構建配置已設置為使用 Electron 的預設圖標，應用程式可以正常構建和運行。

## 可選的圖標文件

如果您想要自定義應用圖標，可以提供以下文件：

### Windows
- `icon.ico` - Windows 應用圖標
  - 建議大小：256x256 像素
  - 格式：ICO（包含多個尺寸：16x16, 32x32, 48x48, 64x64, 128x128, 256x256）

### macOS
- `icon.icns` - macOS 應用圖標
  - 建議大小：512x512 或 1024x1024 像素
  - 格式：ICNS

### Linux
- `icon.png` - Linux 應用圖標
  - 建議大小：512x512 像素
  - 格式：PNG

## 如何創建圖標

### 方法 1: 使用線上工具
- [iConvert Icons](https://iconverticons.com/) - 免費的圖標轉換工具
- [CloudConvert](https://cloudconvert.com/ico-converter) - 線上格式轉換

### 方法 2: 使用設計工具
1. 在 Photoshop/Figma/Sketch 中設計 1024x1024 的圖標
2. 使用工具轉換為各平台格式：
   - Windows: 使用 [png2ico](http://www.winterdrache.de/freeware/png2ico/)
   - macOS: 使用 [Image2icon](http://www.img2icnsapp.com/)

### 方法 3: 使用 Electron Icon Builder
```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./icon.png --output=./assets
```

## 如何啟用自定義圖標

創建好圖標文件後，需要更新 `package.json` 的 `build` 配置：

```json
{
  "build": {
    "win": {
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "installerIcon": "assets/icon.ico",
      "uninstallerIcon": "assets/icon.ico",
      "installerHeaderIcon": "assets/icon.ico"
    },
    "mac": {
      "icon": "assets/icon.icns"
    },
    "linux": {
      "icon": "assets/icon.png"
    }
  }
}
```

## 圖標設計建議

- 使用簡潔的設計，在小尺寸下仍清晰可辨
- 使用與應用功能相關的圖形（如：待辦清單、勾選框、文件等）
- 保持足夠的對比度
- 避免過多細節
- 考慮深色和淺色背景下的顯示效果
