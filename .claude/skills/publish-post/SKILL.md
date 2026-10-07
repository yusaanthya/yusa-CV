---
name: publish-post
description: Use when the user wants to publish an article to this site's blog, or move a note into it — from a HackMD export, a Medium post, another repo (algo-note, career-prep, plans), or any Markdown file. Turns the source into a post under content/posts/, the blog's only source of truth, on a branch for review.
---

# Publish Post — yusa-CV Blog

`content/posts/*.md` is the single source of truth for published posts. Drafts live
anywhere (HackMD, algo-note, career-prep, plans, Medium); publishing means importing a
reviewed copy here. After import, edit the post here, not at the source.

The site reads posts at build time through `lib/content/reader.ts`, validated by
`BlogPostSchema` in `features/blog/types.ts`.

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

Path: `content/posts/<slug>.md`, slug in kebab-case from the title.

```markdown
---
title: "..."
date: "YYYY-MM-DD"
description: "One sentence for the blog list."
tags: ["...", "..."]
published: true
source: "<URL or repo-relative path of the original>"
---
```

- `date`: the original publication date when known (Medium `pubDate`, HackMD export),
  otherwise ask.
- `description`: if the source has none, draft one and tell the user it is new text.
- `source`: records where the post came from; the schema ignores unknown keys, so it is
  provenance only.
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
non-browser requests and break later.

- Download each image to `public/images/posts/<slug>/<n>.<ext>`.
- Reference it as `/images/posts/<slug>/<n>.<ext>`. `lib/markdown.ts` adds the Pages
  base path to root-relative image sources, so do not write `/yusa-CV/` by hand.
- Keep alt text; if the source has none, describe the image briefly.
- If an image cannot be downloaded, stop and ask the user to export it instead of
  linking the remote URL.

## 5. Verify

1. `npm run build` passes and lists `/blog/<slug>`.
2. Check `out/blog/<slug>.html` for the title, every code block, and every image.
3. Screenshot the post in light and dark mode when a headless browser is available, and
   look at it: headings, lists, quotes, code highlighting, images.
4. Report anything that was changed from the source (removed embeds, rewritten
   sensitive details, new description).

## 6. Hand off

- Work on a new branch (`content/<user>/<slug>`), never on `main`.
- Commit the post and its images together, in English.
- Do not push, open a PR, or merge without the user's go-ahead.

Removing a post: delete its `.md` and its `public/images/posts/<slug>/` folder in the
same commit.
