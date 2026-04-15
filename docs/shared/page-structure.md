# UI Refinement — Page Structure

> **Created:** 2026-04-15

## 新增 Component

### `features/ui/components/animate-in.tsx`
- **Type:** Client Component (`'use client'`)
- **Props:**
  ```ts
  interface AnimateInProps {
    children: React.ReactNode
    variant?: 'fade-up' | 'fade-in'  // default: 'fade-up'
    delay?: number                    // seconds, default: 0
    className?: string
  }
  ```
- **Behavior:** `whileInView`, `viewport={{ once: true }}`, duration 0.5s ease-out
- **Reduced motion:** `useReducedMotion()` hook — 偵測到時跳過動畫直接顯示

---

## 顏色 Token

### `tailwind.config.ts`
```ts
brand: {
  DEFAULT: 'hsl(var(--brand))',
}
```

### `app/globals.css`
```css
:root {
  --brand: 27 90% 37%;   /* #b45309, amber-700 */
}
.dark {
  --brand: 32 90% 50%;   /* 稍亮，確保 dark mode 對比度 */
}
```

---

## 頁面別改動

### Home (`app/page.tsx`)
- Hero 標題：`<AnimateIn variant="fade-up">`
- Hero 副標題：`<AnimateIn variant="fade-up" delay={0.1}>`
- CTA 按鈕群組：`<AnimateIn variant="fade-up" delay={0.2}>`
- CTA 主要按鈕：加 `border-brand text-brand hover:bg-brand hover:text-white` 樣式

### Blog Listing (`app/blog/page.tsx`)
- 各 `<PostCard>` 包上 `<AnimateIn delay={index * 0.1}>`

### Blog Post (`app/blog/[slug]/page.tsx`)
- `<article>` 包上 `<AnimateIn variant="fade-in">`

### CV (`app/cv/page.tsx`)
- `<article>` 包上 `<AnimateIn variant="fade-in">`

### Header (`features/ui/components/header.tsx`)
- Nav link hover class：加入 `hover:text-brand`（取代現有 `hover:text-foreground`）

### Tag Chips（Blog Post + PostCard）
- `bg-neutral-100 dark:bg-neutral-800` 維持
- 文字加 `text-brand` 或 hover 時加 brand 顏色

---

## Responsive

- 動畫在所有 breakpoint 一致（Framer Motion 不依賴 CSS breakpoint）
- Brand 顏色在 mobile 同樣適用
