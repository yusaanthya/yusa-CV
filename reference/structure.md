# Project Structure — yusa-CV

> Audited: 2026-10-31 at `d961784d5c73accbf0f022a109b8b97ee740f7d1`.

## Stack and hosting

| Layer | Current implementation |
| --- | --- |
| Framework | Next.js 14.2.14 App Router, React 18, TypeScript 5 |
| Styling | Tailwind CSS 3.3 range, Typography plugin, site CSS tokens |
| Typography | Sora via `next/font/google`; system CJK fallbacks |
| Motion | Framer Motion 11 range, used by scroll lag and project parallax; CSS hero reveal/fades |
| Icons | Lucide React plus shared social glyphs |
| Content | gray-matter, Zod; unified/remark/rehype Markdown-to-HTML pipeline |
| Hosting | Static export to GitHub Pages; no runtime application server |

Versions other than the pinned Next.js version describe `package.json` ranges,
not a claim that each installed package is exactly its range's lower bound.

## Source map

| Path | Responsibility |
| --- | --- |
| `app/layout.tsx` | Sora, site metadata, header/footer, pre-paint appearance and session scripts |
| `app/page.tsx` | Home hero, projects anchor, and earlier-work list |
| `app/blog/page.tsx` | One list row per published post; no filters yet |
| `app/blog/[slug]/page.tsx` | Static article routes and rendered Markdown |
| `app/cv/page.tsx`, `app/cv/print-button.tsx` | CV Markdown page and browser print action |
| `app/globals.css`, `tailwind.config.ts` | Palette, typography, motion, accessibility preferences, and print rules |
| `app/icon.svg`, `app/apple-icon.png` | Site icons |
| `content/cv/yusa-liu.md` | Curated public CV content |
| `content/synced-posts/` | Generated public articles and manifest; not editable originals |
| `features/blog/schema.mjs`, `types.ts` | Runtime schemas and TypeScript post type |
| `features/blog/services/post-files.mjs` | Validate/read snapshots, support legacy local posts, sort by date and slug |
| `features/blog/services/post-service.ts` | Typed facade for blog pages |
| `features/blog/components/post-card.tsx` | Blog list row |
| `features/projects/` | Project data, animated panels, and earlier-work list |
| `features/ui/components/` | Container, header/footer, navigation, appearance toggle, hero name, scroll lag, social icons, and tags |
| `features/ui/social-links.ts` | Shared social destinations and glyph data |
| `lib/markdown.ts`, `lib/utils.ts` | Markdown conversion, heading IDs, supported Pages URL prefixes, and utilities |
| `scripts/sync-blog.mjs`, `scripts/sync-blog.test.mjs` | Committed-source exporter and exporter/reader tests |
| `public/images/` | Portrait, project art, and generated blog assets |
| `.github/workflows/deploy.yml` | Public-only build and Pages deployment |
| `.claude/skills/` | Publishing and planning instructions |
| `docs/`, `reference/` | Design/status documents and historical planning records |

There is no current `lib/content/reader.ts`, `animate-in.tsx`, or `app/portfolio/`.
The legacy `content/posts/` reader remains supported, but that directory is absent
from the audited tree after migration.

## Data flow and routes

Blog pages call `BlogService`, which delegates to `post-files.mjs`. The reader
validates `content/synced-posts/manifest.json` against the Markdown files and
parses their metadata; missing/incomplete snapshots fail the build. The detail
page converts its body with `lib/markdown.ts` and generates a static route per
published slug. The CV reads its fixed Markdown file directly and reuses that
renderer. Projects use `features/projects/projects.ts` rather than Markdown.

| URL | Implementation |
| --- | --- |
| `/` | Home page |
| `/#projects` | Home-page project showcase and navigation target |
| `/cv` | CV with "Print or save as PDF" action |
| `/blog` | Published-post list |
| `/blog/[slug]` | Static article detail |

There is no standalone `/portfolio` or `/about` route; current navigation does
not link to those historical targets.

## Design and appearance

RGB CSS variables provide `paper`, `surface`, `ink`, `mute`, `line`, `accent`,
`on-accent`, and `plum` colors. Appearance follows system preference until a
visitor chooses a `data-theme` override stored in `localStorage`; it does not
use a `.dark` class. Shared containers use `max-w-5xl mx-auto px-6 w-full`;
article wrappers and prose set narrower reading measures. Markdown uses
`prose prose-site`. Code blocks currently use the GitHub dark highlight theme
in both appearances, by [decision](../docs/blog/tasks.md#decisions).

See [site-redesign.md](../docs/shared/site-redesign.md) for design decisions and
public CV constraints.

## Build and deployment

The Node.js 20 workflow runs on pushes to `main` or manual dispatch, with a
`main` guard on the build job. It installs dependencies, builds the static
`out/` export, uploads it, and deploys with `actions/deploy-pages@v4`. Pages
configuration supplies the base path; `NEXT_PUBLIC_BASE_PATH` is passed to the
build. The workflow does not fetch private article sources or run `test:blog`
as a separate step. Run `npm run test:blog` when changing export/reader behavior.

The [content-sync contract](../docs/blog/content-sync.md) owns article publication
and recovery. The [bilingual/filter spec](../docs/blog/2026-10-31-bilingual-articles-and-filters-spec.md)
is documentation only: translation identity/grouping, filtering, and language
switching are not yet implemented. Root metadata exists; the historical ideas
for per-article metadata, generated sitemap/robots files, and RSS remain absent
from the audited tree.
