# Yusa Liu — portfolio, CV, and blog

A Next.js 14 App Router site with a project showcase on the home page, a
Markdown CV at `/cv`, and published articles at `/blog`. It uses TypeScript,
Tailwind CSS, Sora via `next/font`, and Framer Motion for home-page motion.

## Local development

Use Node.js 20, matching the deployment workflow:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages live in `app/`, shared
UI and feature code in `features/`, and the public CV in `content/cv/yusa-liu.md`.

```sh
npm run test:blog   # Snapshot exporter and reader tests
npm run build       # Static export to out/
```

`npm run lint` is configured, but the ESLint 8/config incompatibility remains a
documented follow-up in [the design notes](docs/shared/site-redesign.md#follow-ups).
The Pages workflow builds the site; it does not run `test:blog` as a separate step.

## Blog publishing

Articles are authored in the private `blog-post` repository. Its publishing
workflow exports approved, committed `main` content into generated snapshots
here. The site builds without private-source access. Do not hand-edit
`content/synced-posts/` or `public/images/synced-blog/`.

The three original articles have been migrated with their public slugs preserved;
the current snapshot also includes `harness-preface-zh`. Read
[content synchronization](docs/blog/content-sync.md) for ownership, the inventory,
local preview, and recovery.

The [bilingual articles and filters specification](docs/blog/2026-10-31-bilingual-articles-and-filters-spec.md)
is documentation only. Grouped articles, list filters, and language switching
are not implemented in the audited code.

## Deployment and documentation

`next.config.mjs` enables static export. The
[Pages workflow](.github/workflows/deploy.yml) uses Node.js 20, builds `out/`, and
deploys to GitHub Pages on pushes to `main` or a manual run on `main`. It supplies
the Pages base path and `NEXT_PUBLIC_BASE_PATH` for assets and supported Markdown
links. No runtime application server is deployed.

- [Repository guidance](AGENTS.md)
- [Current project structure](reference/structure.md)
- [Site design and content decisions](docs/shared/site-redesign.md)
- [Blog rendering status](docs/blog/tasks.md)
- [CV status](docs/cv/tasks.md)
- [Shared UI status](docs/shared/tasks.md)
