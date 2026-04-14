# Planning — CV, Portfolio & Blog Tech Docs

> Last updated: 2026-04-14
> Goal: Transform this site into a complete personal site covering CV, Portfolio, and Technical Blog.

---

## Current State vs Target

| Feature | Current | Target |
|---------|---------|--------|
| Home / Hero | Basic hero with 2 CTAs | Refined intro + summary |
| CV / About | Not built | Full CV page with experience, skills, education |
| Portfolio | Not built | Project showcase with case studies |
| Blog | Listing + detail pages | Technical blog with markdown rendering |
| Markdown rendering | Renders as plaintext | Full HTML with code highlighting |
| Navigation | About / Blog / Portfolio links | Working links to all pages |
| Animations | Framer Motion installed, unused | Page transitions, entry animations |

---

## Gap 1 — Markdown Rendering (Blog, Critical)

**Problem:** `app/blog/[slug]/page.tsx` injects `post.content` as raw text inside a `<div className="prose">`. Markdown is not converted to HTML.

**Fix needed:**
- Install `react-markdown` or `next-mdx-remote` (or use `remark` + `rehype` pipeline)
- Recommended: `remark` + `rehype-stringify` + `rehype-highlight` (code syntax highlighting)
- Alternatively: `next-mdx-remote` if MDX (JSX in markdown) is desired later

**Files to change:**
- `app/blog/[slug]/page.tsx` — replace raw content render with a Markdown component
- `package.json` — add `react-markdown` / `rehype-highlight` / `remark-gfm`

---

## Gap 2 — CV Page (New Page)

**Problem:** Route `/portfolio` is linked from the home page CTA but leads to a 404. No `/cv` or `/about` route exists.

**What to build:**
```
app/cv/
  └── page.tsx                  # CV page (Server Component, static)

features/cv/
  ├── types.ts                  # Types: Experience, Education, Skill
  └── components/
      ├── experience-section.tsx
      ├── education-section.tsx
      └── skills-section.tsx

content/cv/
  └── cv.json or cv.md          # CV data source
```

**CV sections to design:**
- Header: Name, title, contact links (GitHub, LinkedIn, email)
- Summary / About
- Work Experience (company, role, date range, bullet points)
- Skills (grouped by category: languages, tools, platforms)
- Education
- Optional: Open source contributions, certifications

**Data approach options:**
- JSON file under `content/cv/` (structured, easy to update)
- Or hardcoded in the component if rarely changes

**Nav update needed:** `header.tsx` — change "About" link to `/cv` or add dedicated CV link.

---

## Gap 3 — Portfolio Page (New Page)

**Problem:** `/portfolio` route is missing. Home hero has "View Portfolio" CTA pointing there.

**What to build:**
```
app/portfolio/
  └── page.tsx                  # Portfolio listing (SSG)
  └── [slug]/
      └── page.tsx              # Project detail page (SSG)

features/portfolio/
  ├── types.ts                  # ProjectPost type + Zod schema
  ├── services/
  │   └── project-service.ts   # getAll, getBySlug (reuse reader.ts pattern)
  └── components/
      ├── project-card.tsx      # Card for listing page
      └── project-detail.tsx   # Optional: detail layout

content/projects/
  └── <slug>.md                 # One markdown file per project
```

**Project frontmatter schema:**
```yaml
---
title: "Project Name"
date: "2024-01-01"
description: "Short summary"
tags: ["Go", "PostgreSQL"]
techStack: ["Go", "Docker", "PostgreSQL"]
status: "completed"          # completed | in-progress | archived
githubUrl: "https://..."     # optional
liveUrl: "https://..."       # optional
coverImage: "/images/..."    # optional
published: true
---
```

**Implementation note:** `lib/content/reader.ts` is already generic — `ProjectService` can call `getHelpers('projects', ProjectSchema)` with zero changes to the reader.

---

## Gap 4 — Navigation Cleanup

**Problem:** `header.tsx` has nav links "About", "Blog", "Portfolio" but:
- "About" → no route exists (`/about` or `/cv`)
- "Portfolio" → no route exists

**Fix:**
- Update "About" href to `/cv` (or keep `/about` and add `app/about/page.tsx` as alias)
- Update "Portfolio" href to `/portfolio` once the page is built
- Header currently has no active-link highlighting — optional UX improvement

---

## Gap 5 — Home Page Refinement

**Current:** Simple hero with two lines of text and two buttons.

**Target improvements:**
- Add a short personal summary paragraph
- Featured blog posts section (latest 2-3 posts)
- Featured projects section (latest 2-3 projects)
- Links to CV / GitHub / LinkedIn

This requires the portfolio + blog services to both be callable from `app/page.tsx`.

---

## Gap 6 — Code Syntax Highlighting (Blog)

For a technical blog, code blocks must be rendered with syntax highlighting.

**Options:**
- `rehype-highlight` (uses highlight.js, easy)
- `rehype-pretty-code` + `shiki` (better output, more setup)

**Files affected:**
- `app/blog/[slug]/page.tsx` — add highlight CSS import
- `app/globals.css` — import highlight.js theme or Shiki theme
- `package.json` — add highlight dep

---

## Gap 7 — Animations (Optional Enhancement)

Framer Motion is already installed. No animations used yet.

**Suggested additions:**
- `opacity` + `y` fade-in for hero section
- Staggered animation on blog/portfolio card lists
- Page transition wrapper in `app/layout.tsx`

Low priority — purely cosmetic.

---

## Gap 8 — SEO & Metadata

**Current:** Root layout has one static `metadata` export with generic title.

**Target:**
- Per-page `generateMetadata()` for blog posts (title, description, OG image)
- Per-page metadata for portfolio projects
- CV page metadata
- `robots.txt` and `sitemap.xml` generation (Next.js built-in or `next-sitemap`)

---

## Suggested Implementation Order

1. **Markdown rendering** — unblocks readable blog (1-2 hours)
2. **Portfolio page** — closes the broken CTA on home (2-4 hours)
3. **CV page** — core identity content (2-3 hours)
4. **Nav cleanup** — fix links after pages exist (30 min)
5. **Home page refinement** — add featured sections (1-2 hours)
6. **Code syntax highlighting** — polish for tech blog (1 hour)
7. **SEO metadata** — per-page metadata (1-2 hours)
8. **Animations** — optional final polish (1-2 hours)

---

## Files That Need No Changes

- `lib/content/reader.ts` — generic enough to serve CV, blog, and portfolio
- `lib/utils.ts` — utility functions are reusable as-is
- `tailwind.config.ts` — design tokens work for all pages
- `next.config.mjs` — static export already configured correctly
- `.github/workflows/deploy.yml` — deployment pipeline works as-is
