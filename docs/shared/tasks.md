# UI Refinement — Tasks

> **Proposal:** [proposal.md](./proposal.md)
> **Page Structure:** [page-structure.md](./page-structure.md)
> **Created:** 2026-04-15

## Overview

| # | Task | File | Done |
|---|------|------|------|
| 1 | 加入 brand color token | `tailwind.config.ts`, `app/globals.css` | ☑ |
| 2 | 建立 AnimateIn component | `features/ui/components/animate-in.tsx` | ☑ |
| 3 | 套用動畫與 brand 顏色 — Home | `app/page.tsx` | ☑ |
| 4 | 套用動畫 — Blog Listing | `app/blog/page.tsx` | ☑ |
| 5 | 套用動畫 — Blog Post | `app/blog/[slug]/page.tsx` | ☑ |
| 6 | 套用動畫 — CV | `app/cv/page.tsx` | ☑ |
| 7 | 更新 Header nav hover 顏色 | `features/ui/components/header.tsx` | ☑ |
| 8 | 驗證 build 正常 | — | ☑ |

---

## Detailed Tasks

### 1. 加入 brand color token

- **Files:** `tailwind.config.ts`, `app/globals.css`
- [ ] `globals.css` `:root` 加入 `--brand: 27 90% 37%;`
- [ ] `globals.css` `.dark` 加入 `--brand: 32 90% 50%;`
- [ ] `tailwind.config.ts` `extend.colors` 加入 `brand: { DEFAULT: 'hsl(var(--brand))' }`

---

### 2. 建立 AnimateIn Component

- **File:** `features/ui/components/animate-in.tsx`
- [ ] `'use client'` directive
- [ ] 使用 `useReducedMotion()` — 偵測到時直接顯示，不播動畫
- [ ] `variant: 'fade-up' | 'fade-in'`，預設 `fade-up`
- [ ] `delay` prop（秒），預設 0
- [ ] `whileInView`, `viewport={{ once: true }}`, duration `0.5`s

---

### 3. Home — 動畫 + brand 顏色

- **File:** `app/page.tsx`
- [ ] Hero 標題、副標題、CTA 依序加 `<AnimateIn>` with increasing delay
- [ ] 主要 CTA 按鈕樣式加入 brand 顏色（border + text，hover 時填滿）

---

### 4. Blog Listing — stagger 動畫

- **File:** `app/blog/page.tsx`
- [ ] 各 PostCard 包上 `<AnimateIn delay={index * 0.1}>`

---

### 5. Blog Post — fade-in

- **File:** `app/blog/[slug]/page.tsx`
- [ ] `<article>` 包上 `<AnimateIn variant="fade-in">`

---

### 6. CV — fade-in

- **File:** `app/cv/page.tsx`
- [ ] `<article>` 包上 `<AnimateIn variant="fade-in">`

---

### 7. Header — nav hover brand 顏色

- **File:** `features/ui/components/header.tsx`
- [ ] Nav link class `hover:text-foreground` 改為 `hover:text-brand`

---

### 8. 驗證 Build

- [ ] `npm run build` 無 error
- [ ] Dev server 確認動畫正常觸發
- [ ] 確認 dark mode 下 brand 顏色對比度正常
