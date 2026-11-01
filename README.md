# 小作家作文集

## 專案結構

```
Lucy-essays/
├── index.html          ← 首頁，直接用瀏覽器打開即可
├── css/
│   └── style.css
├── js/
│   └── app.js
├── essays/
│   ├── index.json      ← 作文總索引（由 Hermes 維護）
│   ├── essay-1.md      ← 文字作文（可選，參考用）
│   └── images/         ← 作文圖片（可選）
└── assets/
```

## 如何使用

### 文字作文
直接把作文文字和圖片傳給我，我會自動：
1. 更新 `essays/index.json`，加入新作文資料
2. 圖片存到 `essays/images/`
3. 重建網站

### 圖片作文
傳給我圖片，我會用 OCR 辨識文字後照同上流程處理。

### 預覽網站
用瀏覽器打開 `index.html` 即可，或任何靜態伺服器：

```bash
# Python 內建
python -m http.server 8080 --directory D:/HermesAgent/Lucy-essays

# 或 Node
npx serve D:/HermesAgent/Lucy-essays
```

## 搜尋功能
首頁輸入框即時搜尋標題和內文，不用重新整理。
