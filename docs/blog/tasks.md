# Blog Markdown Rendering — Status and Remaining Checks

> Original plan: [proposal.md](./proposal.md), created 2026-04-14.
> Audited: 2026-10-31 against `d961784d5c73accbf0f022a109b8b97ee740f7d1`.

The renderer is implemented. The April checklist was not updated when its
overview was marked complete; the remaining checks below are not evidence of
missing Markdown conversion.

## Implemented

- [x] Import highlight.js CSS in `app/globals.css`.
- [x] Share `markdownToHtml()` in `lib/markdown.ts`, using remark parsing/GFM and
  rehype HTML conversion, heading IDs, asset paths, highlighting, and serialization.
- [x] Await conversion in `app/blog/[slug]/page.tsx`.
- [x] Render the resulting HTML with `dangerouslySetInnerHTML`.
- [x] Retain Typography styling through `prose prose-site`.
- [x] Build the static site successfully at the audited revision:
  [Pages run 41187047616](https://github.com/yusaanthya/yusa-CV/actions/runs/41187047616).

These are supported by the renderer and page code, not only dependency entries.

## Open requirements and verification

- [ ] Verify an installation completes without peer-dependency warnings. A
  successful build alone does not establish that the install log had no warnings.
- [ ] Resolve the original separate light/dark syntax-theme requirement. Current
  CSS imports `github-dark.css` and uses a dark code-block background in both site
  appearances. The site now selects appearance with `data-theme` and system
  preference, not `.dark`. No documented decision was found that explicitly
  retires the original light-theme acceptance criterion; do not mark it satisfied.
- [ ] Inspect exported article HTML for highlight token classes such as
  `hljs-keyword`; this audit inspected source and CI status, not generated HTML.
- [ ] Verify headings, lists, links, quotes, tables, GFM task lists/strikethrough,
  and code highlighting visually in light and dark appearances.

## Related work

Snapshot export and reading are implemented; see [content-sync.md](./content-sync.md).
The [bilingual articles and filters specification](./2026-10-31-bilingual-articles-and-filters-spec.md)
describes separate, unimplemented work. It does not reopen the completed renderer.
