# Yusa Liu — portfolio, CV, and blog

A Next.js 14 App Router site with a project showcase on the home page, a
Markdown CV at `/cv`, and published articles at `/blog`. It uses TypeScript,
Tailwind CSS, Sora via `next/font`, and Framer Motion for home-page motion.

## Local development

Use Node.js 24, matching the deployment workflow:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages live in `app/`, shared
UI and feature code in `features/`, and the public CV in `content/cv/yusa-liu.md`.

```sh
npm run test:blog   # Snapshot exporter and reader tests
npm run build       # Static export to out/
npm run lint        # ESLint 8 with next/core-web-vitals and next/typescript
```

[PR CI](.github/workflows/pr-ci.yml) runs these checks on every pull request to
`main`: lint, the type check, `test:blog`, and builds at the site root and with
the `/yusa-CV` Pages base path. The Pages workflow only builds and deploys.

## Blog publishing

Articles are authored in the private `blog-post` repository. Its publishing
workflow exports approved, committed `main` content into generated snapshots
here. The site builds without private-source access. Do not hand-edit
`content/synced-posts/` or `public/images/synced-blog/`.

The three original articles have been migrated with their public slugs preserved;
the current snapshot also includes `harness-preface-zh`. Read
[content synchronization](docs/blog/content-sync.md) for ownership, the inventory,
local preview, and recovery.

Bilingual articles and list filters are implemented, per the
[specification](docs/blog/2026-10-31-bilingual-articles-and-filters-spec.md):
versions sharing a `translationKey` form one article. The list has a
display-language toggle that falls back to the available version and a
single-tag picker; articles have a per-article language switch and localized
metadata. Every snapshot article is currently Chinese-only, so no pair is
live yet; each translation is published separately from `blog-post`.

## Deployment and documentation

`next.config.mjs` enables static export. The
[Pages workflow](.github/workflows/deploy.yml) uses Node.js 24, builds `out/`, and
deploys to GitHub Pages on pushes to `main` or a manual run on `main`. It supplies
the Pages base path and `NEXT_PUBLIC_BASE_PATH` for assets and supported Markdown
links. No runtime application server is deployed.

- [Repository guidance](AGENTS.md)
- [Current project structure](reference/structure.md)
- [Site design and content decisions](docs/shared/site-redesign.md)
- [Blog rendering status](docs/blog/tasks.md)
- [CV status](docs/cv/tasks.md)
- [Shared UI status](docs/shared/tasks.md)
