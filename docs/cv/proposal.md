# CV Page — Proposal

> **Created:** 2026-04-15
> **Status:** Draft

## Goal

建立 `/cv` 頁面，渲染 `YusaLiu_CV_2026_v2.md` 的內容，並提供「Download PDF」按鈕讓訪客可以將目前渲染結果直接列印為 PDF。

## Scope

**改動：**
- `content/cv/yusa-liu.md` — 新增，CV 內容（從 reference/ 複製並調整）
- `app/cv/page.tsx` — 新增，CV 頁面（Server Component，reuse markdown pipeline）
- `app/cv/print-button.tsx` — 新增，「Download PDF」按鈕（Client Component，呼叫 `window.print()`）
- `app/globals.css` — 新增 `@media print` rules，列印時隱藏 header / footer / 按鈕
- `features/ui/components/header.tsx` — 將 "About" nav link 改為指向 `/cv`

**不改動：**
- `lib/content/reader.ts` — 不需要，CV 只有單一固定檔案，直接 `fs.readFile` 即可
- Blog 相關程式碼
- CV 頁面 UI layout — 留待後續 subtask

## Approach

### Markdown Rendering
直接 reuse 上一個 task 的 `markdownToHtml()` pipeline（unified + remark + rehype + highlight），在 Server Component 內 build time 轉換。

### PDF Download
- 新增 `<PrintButton />` Client Component，內含 `onClick={() => window.print()}`
- `@media print` CSS 隱藏 header、footer、PrintButton 本身
- 使用者點擊後瀏覽器開啟列印對話框，選「另存為 PDF」即可下載當前渲染內容

### Content 存放
CV 內容放在 `content/cv/yusa-liu.md`，與 blog posts 分開管理，方便之後獨立更新。

## Acceptance Criteria

- [ ] `/cv` 頁面正確渲染 markdown 內容（heading、list、bold 等）
- [ ] 「Download PDF」按鈕觸發瀏覽器列印
- [ ] 列印預覽中 header、footer、按鈕不出現
- [ ] Header nav 的 "About" 連結指向 `/cv`
- [ ] Build 成功，靜態匯出正常

## Notes

- `[交易所名稱]` placeholder 由作者自行填入後 push
- UI layout 細節（section 樣式、timeline 等）作為後續獨立 subtask

## Related Docs

- [Tasks](./tasks.md)
