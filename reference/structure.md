# Project Structure — yusa-CV

> Last updated: 2026-04-14

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.3 + @tailwindcss/typography |
| Animation | Framer Motion 11 (installed, not yet used) |
| Icons | Lucide React |
| Content Parsing | gray-matter (Markdown + YAML frontmatter) |
| Data Validation | Zod 3.22 |
| Utilities | clsx, tailwind-merge, date-fns |
| Deployment | Static export (`output: 'export'`) → GitHub Pages |

---

## Directory Tree

```
yusa-CV/
├── .claude/
│   └── skills/
│       └── trd-writer/
│           └── SKILL.md            # Claude skill: TRD writer for planning pages
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD: build → GitHub Pages
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (Header + Footer)
│   ├── page.tsx                    # Home page / hero section
│   ├── globals.css                 # Tailwind base + CSS variables
│   ├── favicon.ico
│   └── blog/
│       ├── page.tsx                # Blog listing page
│       └── [slug]/
│           └── page.tsx            # Blog post detail (SSG)
├── content/
│   └── posts/
│       └── hello-world.md          # Sample markdown post
├── features/                       # Feature-based modules
│   ├── blog/
│   │   ├── types.ts                # BlogPost type + Zod schema
│   │   ├── services/
│   │   │   └── post-service.ts     # BlogService: getAllPosts, getPostBySlug
│   │   └── components/
│   │       └── post-card.tsx       # Blog post card UI
│   └── ui/
│       └── components/
│           ├── header.tsx          # Sticky nav bar
│           ├── footer.tsx          # Site footer
│           └── container.tsx       # Max-width layout wrapper
├── lib/
│   ├── utils.ts                    # cn(), formatDate()
│   └── content/
│       └── reader.ts               # Generic markdown DAO (getHelpers, getBySlug)
├── public/                         # Static assets (SVGs)
├── reference/                      # Local reference docs (not deployed)
├── next.config.mjs                 # Static export config
├── tailwind.config.ts              # Design tokens, dark mode
├── tsconfig.json
├── package.json
└── eslint.config.mjs
```

---

## Architecture Patterns

### Feature-Based Folder Structure
Each domain lives under `features/<domain>/` with three layers:
- `types.ts` — TypeScript types + Zod validation schema
- `services/` — Data access layer (server-side, build-time)
- `components/` — React UI components

### Content → Page Data Flow
```
content/<type>/<slug>.md
  └─ gray-matter (parse frontmatter + body)
       └─ lib/content/reader.ts (DAO: validate, sort, slug)
            └─ features/<domain>/services/<service>.ts
                 └─ app/<route>/page.tsx (async Server Component)
```

### Build Strategy
- All pages are statically generated at build time
- `generateStaticParams` used on dynamic routes (e.g., `blog/[slug]`)
- Output: `out/` directory → deployed to GitHub Pages
- No runtime server — fully static

---

## Current Routes

| Route | Status | File |
|-------|--------|------|
| `/` | Done | `app/page.tsx` |
| `/blog` | Done | `app/blog/page.tsx` |
| `/blog/[slug]` | Done | `app/blog/[slug]/page.tsx` |
| `/portfolio` | Not built | — |
| `/cv` or `/about` | Not built | — |

---

## Design System

- **Colors:** HSL CSS variables, semantic naming (primary, muted, accent, etc.)
- **Dark mode:** Via `.dark` class on `<html>`, CSS variable swap
- **Typography:** Inter (Google Fonts) + `@tailwindcss/typography` prose for markdown
- **Layout:** Container (`max-w-4xl mx-auto px-6`) as standard wrapper

---

## CI/CD

- **Trigger:** Push to `main` or manual dispatch
- **Build:** `next build` → `out/`
- **Deploy:** `actions/deploy-pages@v4` → GitHub Pages
- **Node version:** 20
