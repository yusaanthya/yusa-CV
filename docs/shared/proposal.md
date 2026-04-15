# UI Refinement — Proposal

> **Created:** 2026-04-15
> **Status:** Draft

## Goal

在維持現有 Minimal + Typography 風格的前提下，加入 amber accent 顏色和 scroll-based entry 動畫，提升全站視覺層次與記憶點。

## Scope

**改動：**
- `tailwind.config.ts` — 加入 `brand` color token（amber #b45309 系）
- `app/globals.css` — 加入 `--brand` CSS variable（light / dark mode）
- `features/ui/components/animate-in.tsx` — 新增，通用 scroll-based 動畫 wrapper（Client Component）
- `features/ui/components/header.tsx` — nav hover 改用 brand 顏色
- `app/page.tsx` — hero 加入 fade-in 動畫，CTA 按鈕加 brand accent
- `app/cv/page.tsx` — 加入 animate-in wrapper
- `app/blog/page.tsx` — post cards 加 stagger 動畫
- `app/blog/[slug]/page.tsx` — article 加入 fade-in

**不改動：**
- Markdown rendering pipeline
- Content schema
- 路由結構

## Approach

### Accent 顏色
`#b45309`（amber-700）在 HSL 約為 `hsl(27, 90%, 37%)`。加為 `--brand` CSS variable，不取代現有 `--primary`（保留黑白主色調），作為點綴使用：
- Nav link hover
- CTA 按鈕 border / underline
- Tag chips
- Section 分隔線或小標記

Dark mode 下用稍亮的版本（`hsl(32, 90%, 50%)`）確保對比度。

### 動畫
建立通用 `<AnimateIn>` Client Component，使用 Framer Motion `whileInView` + `viewport={{ once: true }}`，支援：
- `fade-up`（預設）：`opacity: 0, y: 20` → `opacity: 1, y: 0`
- `fade-in`：純 opacity
- `delay` prop：用於 stagger（blog cards 等）

Server Component 頁面透過包裝 Client wrapper 的方式引入動畫，不需要整頁改為 Client Component。

## Acceptance Criteria

- [ ] Brand amber 顏色出現在 nav hover、CTA、tags
- [ ] Dark mode 下 brand 顏色對比度正常
- [ ] Home hero 有 fade-up entry 動畫
- [ ] Blog card list 有 stagger 進場
- [ ] CV 頁面內容有 fade-in
- [ ] 動畫在 `prefers-reduced-motion` 下不播放
- [ ] Build 成功

## Related Docs

- [Tasks](./tasks.md)
- [Page Structure](./page-structure.md)
