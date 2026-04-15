# Blog Markdown Rendering — Tasks

> **Proposal:** [proposal.md](./proposal.md)
> **Created:** 2026-04-14

## Overview

| # | Task | File | Done |
|---|------|------|------|
| 1 | 安裝相依套件 | `package.json` | ☑ |
| 2 | 加入 syntax highlight CSS | `app/globals.css` | ☑ |
| 3 | 修改 blog 文章頁面，改用 HTML 渲染 | `app/blog/[slug]/page.tsx` | ☑ |
| 4 | 驗證 build 正常 | — | ☑ |

---

## Detailed Tasks

### 1. 安裝相依套件

- **File:** `package.json`
- **Command:**
  ```bash
  npm install unified remark-parse remark-gfm remark-rehype rehype-highlight rehype-stringify
  ```
- [ ] 確認安裝後無 peer dependency warning

---

### 2. 加入 Syntax Highlight CSS

- **File:** `app/globals.css`
- **Description:** 在全域 CSS 加入 highlight.js theme。Light mode 用 `github` theme，dark mode 用 `github-dark` theme，透過 `.dark` class 切換（對齊現有 Tailwind dark mode 機制）
- [ ] import highlight.js 的 CSS（從 `node_modules/highlight.js/styles/`）
- [ ] 確認 `.dark` class 下套用 dark theme，覆蓋 light theme

範例結構：
```css
/* Light mode highlight.js theme */
@import 'highlight.js/styles/github.css';

/* Dark mode override */
.dark .hljs {
  /* github-dark theme variables */
}
```
或直接 import 兩份、用 `.dark` class 覆蓋即可。

---

### 3. 修改 Blog 文章頁面

- **File:** `app/blog/[slug]/page.tsx`
- **Description:** 將 markdown string 透過 `unified` pipeline 轉換為 HTML string，改用 `dangerouslySetInnerHTML` 渲染
- [ ] 建立 `markdownToHtml(content: string): Promise<string>` 函式（可放在 lib/ 或 inline）
- [ ] 在 page component 內 await 轉換結果
- [ ] 將原本的 `<div>{post.content}</div>` 改為 `<div dangerouslySetInnerHTML={{ __html: htmlContent }} />`
- [ ] 確認 `.prose` class 仍保留（Tailwind typography 處理基本排版）

轉換函式範例：
```ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

async function markdownToHtml(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content)
  return String(result)
}
```

---

### 4. 驗證 Build

- **Description:** 確認靜態匯出正常，無 build error
- [ ] 執行 `npm run build`，確認無 error
- [ ] 開啟 `out/blog/<slug>/index.html`，確認 HTML 包含 highlight.js class（如 `hljs-keyword`）
- [ ] 在 dev server (`npm run dev`) 確認 light / dark mode 下 syntax highlighting 顯示正確
