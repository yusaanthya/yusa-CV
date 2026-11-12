# Yusa Liu — portfolio, CV, and blog

A Next.js App Router site with a project showcase on the home page, a
Markdown CV at `/cv`, and published articles at `/blog`. It uses TypeScript,
Tailwind CSS, Sora via `next/font`, and Framer Motion for home-page motion.

## Local development

Use the Node.js version in `.nvmrc`, which the workflows also read:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages live in `app/`, shared
UI and feature code in `features/`, and the public CV in `content/cv/yusa-liu.md`.

```sh
npm test            # Exporter, reader, and review-gate script tests
npm run build       # Static export to out/
npm run lint        # ESLint with next/core-web-vitals and next/typescript
```

[PR CI](.github/workflows/pr-ci.yml) runs these checks on every pull request to
`main`: lint, the type check, `npm test`, and builds at the site root and with
the `/yusa-CV` Pages base path. The Pages workflow only builds and deploys.

## Routes and data flow

| URL | Source |
| --- | --- |
| `/`, `/#projects` | Home page; project copy in `features/projects/projects.ts` |
| `/cv` | `content/cv/yusa-liu.md`, with a "Print or save as PDF" action |
| `/blog` | One card per article, from the snapshot in `content/synced-posts/` |
| `/blog/[slug]` | One static page per published language version |

Blog pages call `BlogService`, which reads the snapshot through
`features/blog/services/post-files.mjs`. That reader checks
`content/synced-posts/manifest.json` against the Markdown files and validates
their metadata; a missing or incomplete snapshot fails the build. Article and CV
bodies are converted by `lib/markdown.ts`.

## Blog publishing

Articles are authored in the private `blog-post` repository. Its publishing
workflow exports approved, committed `main` content and opens a pull request
here with the generated snapshot. The site builds without private-source
access. Do not hand-edit `content/synced-posts/` or
`public/images/synced-blog/`; `content/synced-posts/manifest.json` lists the
published slugs. Read [content synchronization](docs/blog/content-sync.md) for
ownership, the article contract, what the private workflow depends on here,
local preview, and recovery.

Versions of an article that share a `translationKey` form one article: the list
has a display-language toggle that falls back to the available version and a
single-tag picker, and articles have a language switch and localized metadata.
Each translation is published separately from `blog-post`. The
[bilingual specification](docs/blog/2026-10-31-bilingual-articles-and-filters-spec.md)
is the design record.

## Deployment and base path

`next.config.mjs` enables static export. The
[Pages workflow](.github/workflows/deploy.yml) builds `out/` and deploys to GitHub Pages on pushes to `main` or a manual run on `main`. No runtime
application server is deployed.

The site is served under `/yusa-CV`, and two separate settings carry that prefix:

- Next's `basePath`, used by `Link` and the router. `actions/configure-pages`
  injects it at deploy time, so `next.config.mjs` deliberately does not read it
  from an environment variable.
- `NEXT_PUBLIC_BASE_PATH`, used by `assetPath()` for images, Markdown links and
  images, and absolute metadata URLs.

Both must hold the same value. A local build that sets only one produces
inconsistent URLs; PR CI sets both for its `/yusa-CV` build.

## Documentation

- [Repository guidance](AGENTS.md): article and CV ownership rules
- [Site design and content decisions](docs/shared/site-redesign.md)
- [Blog content synchronization](docs/blog/content-sync.md)
- [Codex review merge gate](docs/codex-review-gate.md)
