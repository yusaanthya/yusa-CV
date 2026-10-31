# Blog Markdown Rendering — Status

> Original plan: [proposal.md](./proposal.md), created 2026-04-14.
> Audited: 2026-10-31 at `d961784`.

The renderer is implemented.

## Implemented

- [x] Import highlight.js CSS in `app/globals.css`.
- [x] Share `markdownToHtml()` in `lib/markdown.ts`, using remark parsing/GFM and
  rehype HTML conversion, heading IDs, asset paths, highlighting, and serialization.
- [x] Await conversion in `app/blog/[slug]/page.tsx`.
- [x] Render the resulting HTML with `dangerouslySetInnerHTML`.
- [x] Retain Typography styling through `prose prose-site`.
- [x] Build the static site successfully:
  [Pages run 41187047616](https://github.com/yusaanthya/yusa-CV/actions/runs/41187047616).

## Decisions

- **Code blocks stay dark in both appearances (2026-10-31).** The April plan asked
  for separate light and dark syntax themes. The site keeps `github-dark.css` with
  a dark code-block background in light and dark mode instead; this retires that
  acceptance item.

## Remaining checks

- [ ] Confirm `npm ci` completes without peer-dependency warnings.
- [x] Confirm exported article HTML contains highlight token classes such as
  `hljs-keyword` (both LeetCode articles, local static export, 2026-10-31).
- [ ] Check headings, lists, links, quotes, tables, GFM task lists/strikethrough,
  and code highlighting in a browser, in light and dark appearances.

## Related work

Snapshot export and reading are implemented; see [content-sync.md](./content-sync.md).
The [bilingual articles and filters specification](./2026-10-31-bilingual-articles-and-filters-spec.md)
is separate work and is implemented.
