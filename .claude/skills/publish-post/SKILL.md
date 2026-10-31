---
name: publish-post
description: Prepare or update articles for this site's blog, including imports from Markdown, HackMD, Medium, or another repo. Route new and migrated articles to blog-post; preserve explicitly unmigrated website articles until migration is requested.
---

# Publish Post — yusa-CV Blog

Follow the article ownership rules in [AGENTS.md](../../../AGENTS.md).
`blog-post` owns new and migrated articles, including imports from other sources.
Edit them there on a feature branch; never hand-edit a synchronized website copy
or create a second editable original. Publication is a private-source export of
committed `main` articles explicitly marked `published: true`. The public
website must not receive a private-source read credential.

Check [the migration inventory and implementation status](../../../docs/blog/content-sync.md)
before editing. Unmigrated articles in `content/posts/` remain legacy originals
until migration is requested. Do not infer migration from the presence of sync
code. Check the publishing workflow and PR/merge status before claiming that
automation is active.

The site combines local and synchronized posts at build time through
`features/blog/services/post-service.ts`; both list and direct-page access use
the same publication rules.

## 1. Identify the source

Ask for the source if it is not given. Supported forms:

- **HackMD:** the user exports the note as `.md` (no API, no token) and gives the path.
- **Local repo file:** a path in `../algo-note`, `../career-prep`, `../plans`, or elsewhere.
- **Medium:** article pages are behind Cloudflare; fetch the full text from the RSS feed
  `https://medium.com/feed/@<user>` instead and take the matching `<item>`.

Read the whole source before writing anything.

## 2. Check what may be published

- **career-prep or plans:** these hold interview prep and raw work records. Before
  importing, read that repo's `AGENTS.md`/`CLAUDE.md` privacy rules. Remove or rewrite
  confidential company data, internal URLs and ticket IDs, customer or partner data,
  credentials, and private production identifiers into public-safe wording. List every
  such change for the user and get approval before committing.
- **algo-note:** practice notes; usually need a short introduction for readers.
- Never invent results, metrics, or claims the source does not support.

## 3. Write the post

For new or migrated articles, use `blog-post/<series>/<zh|en>/<filename>.md`.
Choose a stable, flat kebab-case slug; during migration retain the existing URL
slug even if the filename or directory changes. For an unmigrated legacy edit,
retain its existing `content/posts/<slug>.md` until migration is authorized.

```markdown
---
title: "..."
slug: "stable-article-slug"
lang: "zh"
translationKey: "shared-article-key" # optional; only to pair language versions
date: "YYYY-MM-DD"
description: "One sentence for the blog list."
tags: ["...", "..."]
published: false
---
```

- `date`: the original publication date when known (Medium `pubDate`, HackMD export),
  otherwise ask.
- `description`: if the source has none, draft one and tell the user it is new text.
- `published`: leave false until publication is approved. Only committed source
  `main` with explicit true is eligible; missing publication metadata means draft.
- `lang`: match the source language directory. Preserve public provenance links,
  but do not export internal source paths, credentials, or private work records.
- `translationKey`: omit unless the article is one language version of another.
  Paired versions share the same key in slug format (lowercase kebab-case), each
  with its own `lang`; at most one published version per key and language. The
  key never chooses or changes a URL, and a key matching an unkeyed article's
  slug does not pair them. To pair an existing article, add the key to both
  source files without changing slugs, dates, prose, or assets, then regenerate
  the snapshot. Invalid keys, a key without `lang`, or duplicate key/language
  pairs fail export and the website build. See
  [translation pairs](../../../docs/blog/content-sync.md#translation-pairs).
  Publishing a translation is a separate owner-approved action; never invent
  translation text or dates.
- Keep the author's wording and title. Do not rewrite content or "correct" names
  (e.g. a problem title) without asking.
- Convert source-specific syntax to plain GFM:
  - HackMD containers `:::info` / `:::warning` / `:::success` → blockquotes, keeping the label.
  - HackMD `[TOC]`, `{%youtube id %}` and similar embeds → remove, or a plain link.
  - Medium/HTML → Markdown; drop tracking pixels (`medium.com/_/stat`).
  - Tag fenced code with its language (```` ```python ````) so highlighting applies.
- If the post was published elsewhere first, end it with
  `*Originally published on [Medium](url).*` (or the matching platform).

## 4. Images

Do not hotlink images from HackMD or Medium: HackMD `_uploads` URLs can return 403 to
non-browser requests and break later. The migrated `sign-key-disassemble` article
retains its five existing HackMD links to preserve the original content; replacing
those requires the original exported images and is a separate content change.

- For source-owned articles, store images inside `blog-post` and use relative
  links. The publication exporter owns conversion to website asset paths.
- For unmigrated legacy articles, retain the local image layout under
  `public/images/posts/<slug>/` with `/images/posts/<slug>/...` references.
  Do not write the `/yusa-CV/` deployment prefix into source article paths.
- Keep alt text; if the source has none, describe the image briefly.
- If an image cannot be downloaded, stop and ask the user to export it instead of
  linking the remote URL.

## 5. Verify

1. Regenerate the snapshot from the committed source using `npm run sync:blog --
   --source /path/to/blog-post`, then run `npm run build`. The build must pass and
   list `/blog/<slug>`. Production export runs only inside private source Actions.
2. Check `out/blog/<slug>/index.html` for the title, every code block, and every image.
3. Screenshot the post in light and dark mode when a headless browser is available, and
   look at it: headings, lists, quotes, code highlighting, images.
4. Report anything that was changed from the source (removed embeds, rewritten
   sensitive details, new description).

## 6. Hand off

- Work on a feature branch in the article's owning repository, never on `main`.
- Commit the post and its images together, in English.
- Do not push, open a PR, or merge without the user's go-ahead.

For a source-owned article, withdraw it in `blog-post` and regenerate the public
snapshot; never patch only the website copy. For a legacy article, remove its
local source and exclusively owned assets only when removal is requested.
Withdrawal removes the current page, not copies in public history or caches.
