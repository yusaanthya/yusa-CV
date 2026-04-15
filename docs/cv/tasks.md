# CV Page — Tasks

> **Proposal:** [proposal.md](./proposal.md)
> **Created:** 2026-04-15

## Overview

| # | Task | File | Done |
|---|------|------|------|
| 1 | 建立 CV markdown 內容檔 | `content/cv/yusa-liu.md` | ☑ |
| 2 | 建立 CV 頁面（Server Component） | `app/cv/page.tsx` | ☑ |
| 3 | 建立 PDF 下載按鈕（Client Component） | `app/cv/print-button.tsx` | ☑ |
| 4 | 加入 `@media print` CSS | `app/globals.css` | ☑ |
| 5 | 修正 Header nav 連結 | `features/ui/components/header.tsx` | ☑ |
| 6 | 驗證 build 正常 | — | ☑ |

---

## Detailed Tasks

### 1. 建立 CV markdown 內容檔

- **File:** `content/cv/yusa-liu.md`
- **Description:** 將 `reference/YusaLiu_CV_2026_v2.md` 的內容複製到此路徑，作為 CV 頁面的 content source
- [ ] 建立 `content/cv/` 目錄
- [ ] 複製 CV 內容至 `content/cv/yusa-liu.md`

---

### 2. 建立 CV 頁面

- **File:** `app/cv/page.tsx`
- **Description:** Server Component，直接讀取 `content/cv/yusa-liu.md`，透過 `markdownToHtml()` 轉換後渲染
- [ ] 讀取 `content/cv/yusa-liu.md`（用 `fs.readFile`，不需要經過 reader.ts）
- [ ] Reuse `markdownToHtml()` 轉換（可從 blog/[slug]/page.tsx 抽出共用，或直接 inline）
- [ ] 渲染結果用 `dangerouslySetInnerHTML`，套用 `prose prose-neutral dark:prose-invert` class
- [ ] 加入 `<PrintButton />` 於頁面頂部

---

### 3. 建立 PDF 下載按鈕

- **File:** `app/cv/print-button.tsx`
- **Description:** `'use client'` Client Component，按鈕觸發 `window.print()`
- [ ] 加上 `'use client'` directive
- [ ] 按鈕文字：「Download PDF」
- [ ] onClick: `window.print()`
- [ ] 加上 `print:hidden` Tailwind class（列印時隱藏）

---

### 4. 加入 `@media print` CSS

- **File:** `app/globals.css`
- **Description:** 列印時隱藏不必要的 UI 元素
- [ ] `header`、`footer` 設為 `display: none`
- [ ] 確認 prose 內容在列印時排版正常（字體大小、margin 等）

---

### 5. 修正 Header nav 連結

- **File:** `features/ui/components/header.tsx`
- **Description:** 將 "About" nav link href 從 `/` 改為 `/cv`
- [ ] 找到 About link，修改 href

---

### 6. 驗證 Build

- **Description:** 確認靜態匯出正常
- [ ] `npm run build` 無 error
- [ ] `/cv` 路由出現在 build output
- [ ] 在 dev server 確認頁面渲染、列印按鈕正常
