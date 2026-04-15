# Blog Markdown Rendering — Proposal

> **Created:** 2026-04-14
> **Status:** Draft

## Goal

修正 `app/blog/[slug]/page.tsx` 目前將 markdown 當純文字輸出的問題，改為在 build time 將 `.md` 內容轉換成 HTML，並支援：
- 標準 Markdown 語法（heading、list、blockquote、table、link 等）
- GitHub Flavored Markdown（GFM：task list、strikethrough、autolink）
- Syntax highlighting，跟隨 site dark mode

## Scope

**改動：**
- `app/blog/[slug]/page.tsx` — 加入 markdown → HTML 轉換，改用 `dangerouslySetInnerHTML` 渲染
- `app/globals.css` — 加入 highlight.js 的 light / dark theme CSS
- `package.json` — 新增 `unified`、`remark-parse`、`remark-gfm`、`remark-rehype`、`rehype-highlight`、`rehype-stringify`

**不改動：**
- `lib/content/reader.ts` — content 讀取邏輯不變，`post.content` 繼續傳原始 markdown string
- `features/blog/` — types、service、PostCard 不變
- Blog 文章頁面的 UI 佈局（留待後續 task）

## Approach

使用 `unified` remark/rehype pipeline，在 Server Component 內於 build time 執行：

```
markdown string
  → remark-parse（解析 AST）
  → remark-gfm（GFM 擴充）
  → remark-rehype（轉換為 HTML AST）
  → rehype-highlight（加 highlight.js class）
  → rehype-stringify（輸出 HTML string）
  → dangerouslySetInnerHTML
```

全部在 server side 執行，不增加 client bundle size。

Syntax highlighting 主題：import highlight.js 的 `github.css`（light）與 `github-dark.css`（dark），用 CSS `@media` 或 `.dark` class 控制切換，與現有 Tailwind dark mode 對齊。

## Acceptance Criteria

- [ ] Blog 文章頁面正確渲染 heading、list、link、blockquote、table
- [ ] GFM task list、strikethrough 正確渲染
- [ ] Code block 有 syntax highlighting
- [ ] Syntax highlighting 在 light mode 使用亮色主題、dark mode 使用暗色主題
- [ ] Build（`next build`）無 error，靜態匯出正常

## Related Docs

- [Tasks](./tasks.md)
