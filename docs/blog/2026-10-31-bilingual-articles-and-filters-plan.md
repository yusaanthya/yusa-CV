# Bilingual Blog Articles and Filters — Implementation Plan

> Created: 2026-10-31
> Status: Proposed for owner review
> Spec: [2026-10-31-bilingual-articles-and-filters-spec.md](./2026-10-31-bilingual-articles-and-filters-spec.md)
> Code baseline: `dd166b536761433fb490b454f38901fde87f69ae` (`main`)

## Scope and baseline

This plan implements the approved spec. The owner has accepted its three proposed design choices, so they are now requirements:

- In `All`, a card shows the Chinese version when one is published.
- Tag filtering matches the union of tags across a group's published versions.
- Lists are ordered by the earliest date among the currently published versions.

The spec was written against `fc3a975`. Between that commit and `dd166b5`, the only changes were to documentation, ESLint configuration (`.eslintrc.json`, the `lint` script) and `tailwind.config.ts`. Nothing changed under `features/`, `scripts/`, `app/` or `lib/`, so the "Verified current behavior" table in the spec still describes the code.

Baseline facts this plan relies on:

- **Snapshot:** `content/synced-posts/` holds four published variants: `harness-preface-zh`, `leetcode-3sum`, `leetcode-container-with-max-water` and `sign-key-disassemble`. All four have `lang: zh` and none has a translation key. `content/posts/` (legacy) is absent, but the reader still supports it.
- **Metadata contract:** `BlogPostSchema` is a plain `z.object`. `ImportedPostSchema` extends it with `.extend()`, and `post-files.mjs` reads `BlogPostSchema.shape.slug`. The schema therefore has to stay a `ZodObject`; wrapping it in `.refine`/`.superRefine` would break both uses.
- **Exporter output:** The exporter writes `matter.stringify(body, metadata)`, where `metadata` is the Zod-parsed object. Zod strips unknown keys, so a key added to the schema is carried through automatically and other source keys stay excluded. Zod also emits keys in schema shape order, and absent optional keys are not emitted. Snapshots without a key therefore stay byte-identical as long as the new key is added at the end of the shape.
- **Base path:** `next.config.mjs` has no `basePath`. In CI, `actions/configure-pages` (`static_site_generator: next`) injects it, and the workflow sets `NEXT_PUBLIC_BASE_PATH` from the same value. `next/link` and `router.push` add the base path to hrefs automatically. `assetPath()` in `lib/utils.ts` adds `NEXT_PUBLIC_BASE_PATH` by hand, for strings that Next does not prefix.
- **Router:** Next is `14.2.14`, with `output: 'export'` and `trailingSlash: true`. `missingSuspenseWithCSRBailout` defaults to `true`, so `useSearchParams()` without a `<Suspense>` boundary fails the static build. The App Router patches `window.history.pushState` and keeps `useSearchParams()` in sync with it (window history support has been stable since 14.1).
- **Tests:** `npm run test:blog` runs `node --test scripts/sync-blog.test.mjs`. The test helpers create temporary Git source repositories and site roots under `os.tmpdir()`. Pure data logic lives in `.mjs` files with JSDoc so that `node --test` can import it without a TypeScript loader. CI uses Node 20; the local environment has Node 22.

Out of scope, as in the spec: whole-site localization, an i18n framework, publishing any translation, editing source articles, multi-tag selection, search, pagination, RSS/sitemap, and any change to workflows or credentials.

## Interface contract

UI tasks build against this contract only. Every data module listed here is pure (it imports no `node:fs`), except `post-files.mjs`, which already reads files.

### Metadata (`features/blog/schema.mjs`)

```js
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// BlogPostSchema keeps its existing fields in their existing order, then adds
// as the LAST key:
translationKey: z.string().regex(slugPattern).optional(),
```

- `BlogPostSchema.shape.slug` keeps using the same pattern.
- `ImportedPostSchema` stays `BlogPostSchema.extend({ published: z.literal(true), lang: z.enum(['zh','en']) })`.
- The rule "a keyed post must have a `lang`" is not in the schema. `assertValidPairing` enforces it (see below), so both schemas can stay `ZodObject`.

### Types (`features/blog/types.ts`)

```ts
export type BlogLang = 'zh' | 'en';

// Unchanged shape; z.infer now includes `translationKey?: string`.
export type BlogPost = z.infer<typeof BlogPostSchema> & { content: string; readingTime?: string };

/** One published version as sent to the browser. No body, no source path, no coverImage. */
export interface BlogArticleVersion {
    slug: string;
    lang?: BlogLang;          // absent only for unlabelled legacy posts
    title: string;
    description: string;
    date: string;             // the version's own YYYY-MM-DD
}

/** One logical article (one list card). */
export interface BlogArticleSummary {
    id: string;               // `key:<translationKey>` or `slug:<slug>`; separate namespaces
    date: string;             // earliest date among published versions
    tags: string[];           // distinct union, first-seen order following `versions` order
    versions: BlogArticleVersion[]; // ordered zh, en; an unlabelled legacy post has exactly one
}

export type BlogLangFilter = 'all' | BlogLang;
export interface BlogFilters { lang: BlogLangFilter; tag: string | null } // null = All tags
```

### Grouping, selection and filtering (`features/blog/services/post-groups.mjs`, new, pure)

Each function has JSDoc types that reference `../types`.

| Export | Signature | Behavior |
| --- | --- | --- |
| `assertValidPairing` | `(posts: Pick<BlogPost,'slug'\|'lang'\|'translationKey'>[]) => void` | Throws if a keyed post has no `lang`, or if two posts share a key/lang pair. Error messages name the slug(s) and the key. The exporter and the reader both call it. |
| `groupBlogPosts` | `(posts: BlogPost[]) => BlogArticleSummary[]` | Calls `assertValidPairing` first. Groups by explicit key; unkeyed posts become standalone articles. Derives `date` and `tags`. Sorts by `date` descending, then `id` ascending. |
| `findArticleVersions` | `(articles: BlogArticleSummary[], slug: string) => BlogArticleVersion[]` | Returns the published versions of the article containing `slug` (including that slug), or `[]` if the slug is not found. |
| `selectVersion` | `(article: BlogArticleSummary, lang: BlogLangFilter) => BlogArticleVersion \| null` | `'all'` returns the `zh` version, else the `en` version, else `versions[0]`. A specific language returns that version or `null` (no fallback). |
| `filterArticles` | `(articles, filters: BlogFilters) => { article: BlogArticleSummary; version: BlogArticleVersion }[]` | Applies the language and tag conditions with AND. Preserves the input order. `version` is the one to display. |
| `collectTags` | `(articles: BlogArticleSummary[]) => string[]` | Distinct union of all article tags, sorted with `localeCompare(…, 'en', { sensitivity: 'base' })`. It is independent of the language filter. |
| `parseBlogFilters` | `(params: URLSearchParams, availableTags: string[]) => BlogFilters` | `lang` other than `en`/`zh` becomes `'all'`. A `tag` not in `availableTags` becomes `null`. The two fall back independently. |
| `blogFilterQuery` | `(filters: BlogFilters) => string` | Returns `""` for All/All tags. Otherwise returns `?lang=…&tag=…`, built with `URLSearchParams` and with keys omitted when they are `All`. |
| `LANGUAGE_LABELS` | `{ zh: '繁體中文', en: 'English' }` | Label text for controls and links. |
| `CONTENT_LANGUAGE` | `{ zh: 'zh-Hant', en: 'en' }` | Values for the HTML `lang` and `hrefLang` attributes. |

### Reader (`features/blog/services/post-files.mjs`)

- `readBlogPosts(root)` keeps its flat output and its existing sort. Before returning, it calls `assertValidPairing(posts)` on all admitted posts (local and imported). A bad snapshot therefore fails loading.
- `readBlogPost(slug, root)` is unchanged.

### Service (`features/blog/services/post-service.ts`)

```ts
BlogService.getAllPosts(): Promise<BlogPost[]>                         // unchanged
BlogService.getPostBySlug(slug): Promise<BlogPost | null>              // unchanged
BlogService.getArticleSummaries(): Promise<BlogArticleSummary[]>       // groupBlogPosts(readBlogPosts())
BlogService.getArticleVersions(slug): Promise<BlogArticleVersion[]>    // findArticleVersions(summaries, slug)
```

### Site origin and absolute URLs (`lib/site.ts`, new)

```ts
export const SITE_ORIGIN = "https://yusaanthya.github.io"; // declared site metadata, not inferred
export function absoluteUrl(path: string): string           // `${SITE_ORIGIN}${assetPath(path)}`
export function articleUrl(slug: string): string            // absoluteUrl(`/blog/${slug}/`)
```

The base path comes from `NEXT_PUBLIC_BASE_PATH` at build time: empty for a root build, `/yusa-CV` on Pages. Example: `articleUrl('harness-preface-zh')` returns `https://yusaanthya.github.io/yusa-CV/blog/harness-preface-zh/` in the Pages build.

Prefix rules for UI tasks:

| Kind of URL | How to write it |
| --- | --- |
| `next/link` hrefs | Plain `/blog/<slug>/`. Never pass them through `assetPath` (that produces a double prefix). |
| Canonical and alternate metadata | `articleUrl()` |
| Browser URL updates | Query-only, relative to the current location (see Task 2.1). |

## Phases and tasks

### Phase 1 — Data layer

Tasks 1.2 and 1.3 depend on Task 1.1. Once 1.1 is merged, they own disjoint files and can run in parallel.

#### Task 1.1 — Schema, pairing rules, types, site URL helper

- **Owns:** `features/blog/schema.mjs`, `features/blog/services/post-groups.mjs` (new), `features/blog/types.ts`, `lib/site.ts` (new), `scripts/post-groups.test.mjs` (new), `package.json` (only the `test:blog` script, changed to `node --test scripts/sync-blog.test.mjs scripts/post-groups.test.mjs`).
- **Reads:** this spec and plan, `post-files.mjs`, `lib/utils.ts`.
- **Must not touch:** `scripts/sync-blog.mjs`, `post-files.mjs`, `post-service.ts`, any `app/` or component file, `content/synced-posts/`, `public/images/synced-blog/`.
- **Work:**
  - Add `slugPattern` and `translationKey` (last key) to the schema.
  - Implement every `post-groups.mjs` export exactly as listed in the contract, including `LANGUAGE_LABELS` and `CONTENT_LANGUAGE`.
  - Add the types and the `lib/site.ts` helpers.
  - Write pure unit tests on in-memory post arrays (cases listed in the test plan).
- **Acceptance criteria:** 2, 3, 4, 5 and the parsing part of 6, at the data boundary. Provides the foundation for 7 and 8.

#### Task 1.2 — Exporter carries and validates identity

- **Owns:** `scripts/sync-blog.mjs`, `scripts/sync-blog.test.mjs`.
- **Reads:** `schema.mjs`, `post-groups.mjs`, `post-files.mjs`.
- **Must not touch:** schema or grouping logic (report gaps to the Task 1.1 owner instead), the reader, the UI, generated content.
- **Work:**
  - After all published source posts have been collected, call `assertValidPairing` on two sets together: the metadata of published local legacy posts, which the exporter already parses, and the metadata of the exported posts. Do this before anything is written. The existing `fs.rmSync(marker)` at the start of the export already makes a failure leave no manifest behind.
  - No other exporter logic changes. `translationKey` passes through because the schema now includes it.
- **Acceptance criteria:** 3 and 7 (export side), and 2 (the exported pair can be read back as one group).

#### Task 1.3 — Reader validation and service

- **Owns:** `features/blog/services/post-files.mjs`, `features/blog/services/post-service.ts`, `scripts/post-files.test.mjs` (new; appended to the `test:blog` script list, which is the single exception to Task 1.1 owning `package.json`).
- **Reads:** `schema.mjs`, `post-groups.mjs`, `types.ts`, the existing reader tests in `sync-blog.test.mjs`.
- **Must not touch:** the exporter, its tests, the UI, generated content.
- **Work:**
  - Call `assertValidPairing` in `readBlogPosts` before returning.
  - Add `getArticleSummaries` and `getArticleVersions`.
  - The tests write hand-built snapshot directories (manifest plus Markdown files) into a temporary root under `os.tmpdir()`, never into the repository.
- **Acceptance criteria:** 1 (existing snapshots still load), 3 (snapshot-loading side), 7.

The Phase 1 exit check is `npm run test:blog`, which must pass. Existing tests in `sync-blog.test.mjs` must pass without edits, other than additions.

### Phase 2 — UI and docs (parallel; the file sets are disjoint)

#### Task 2.1 — Grouped list, cards, filters

- **Owns:** `app/blog/page.tsx`, `features/blog/components/post-card.tsx`, `features/blog/components/article-list.tsx` (new, server-safe, no hooks), `features/blog/components/blog-filters.tsx` (new, `"use client"`).
- **Reads:** the contract modules, `features/ui/components/tag-list.tsx`, `lib/utils.ts`, `nav-links.tsx` and `theme-toggle.tsx` (existing client component conventions), `app/globals.css`, `tailwind.config.ts`.
- **Must not touch:** `app/blog/[slug]/page.tsx`, the data layer, `app/layout.tsx`, `next.config.mjs` (except temporary verification edits, which must be reverted).
- **Work:**
  - **`page.tsx`:** Load `articles = await BlogService.getArticleSummaries()` and `tags = collectTags(articles)`. Render:

    ```tsx
    <Suspense fallback={<ArticleList entries={filterArticles(articles, { lang: 'all', tag: null })} />}>
      <BlogFilters articles={articles} tags={tags} />
    </Suspense>
    ```

    The fallback is what the exported HTML contains: the unfiltered, Chinese-first list with working links. That is the no-JavaScript state, so it satisfies AC10. Pass only `BlogArticleSummary[]` and `string[]` to the client component.
  - **`blog-filters.tsx`:**
    - Read state with `useSearchParams()` and `parseBlogFilters`. Derive the displayed list with `filterArticles`.
    - Update the URL with `window.history.pushState(null, "", query || window.location.pathname)`, where `query = blogFilterQuery(next)`. A query-only relative URL keeps whatever base path is already in the location, so the prefix can never be doubled or dropped. Next 14.2 syncs `useSearchParams` with pushState, and each change creates a history entry. Do not keep the filter in separate React state; the URL is the single source of truth, which makes Back/Forward, refresh and copied URLs work without extra code.
    - Controls: a labelled language group (`All`, `English`, `繁體中文`) and a labelled tag `<select>` (`All tags` plus the tags). Show the match count in an `aria-live="polite"` element. When there are no matches, show `No articles match these filters.` and a `Clear filters` button. Show which option is selected with something other than color alone, such as weight, an underline or a check mark, plus `aria-pressed` or `aria-checked`.
  - **`post-card.tsx`:** Change the props to `{ article: BlogArticleSummary; version: BlogArticleVersion }`.
    - Show `article.date`, not the version's own date.
    - The title link goes to `/blog/${version.slug}/` and keeps the stretched `after:absolute after:inset-0` link.
    - When the article has more than one version, render a language link list as a sibling of the `<h2>`, never nested inside the title link. Each link: `href=/blog/<slug>/`, `lang` and `hrefLang` from `CONTENT_LANGUAGE`, and `aria-current` on the displayed version. Give the link list `relative z-10` so the stretched link does not cover it.
    - When the article has a single labelled version, show a plain language label, not a link.
    - Unlabelled legacy posts show no language label.
    - Put `lang={CONTENT_LANGUAGE[version.lang]}` on the title and the description (not the whole card), only when the version has a `lang`.
    - Tags show `article.tags`.
  - **`article-list.tsx`:** Takes the entries returned by `filterArticles` and renders the existing `<ul className="flex flex-col gap-3">` of `PostCard`s. Both the server fallback and `BlogFilters` use it.
- **Acceptance criteria:** 1, 2 (card links), 4 and 5 (display), 6, 9 (list), 10.

#### Task 2.2 — Article page switch, metadata, language attributes

- **Owns:** `app/blog/[slug]/page.tsx`, `features/blog/components/article-language-switch.tsx` (new, server component).
- **Reads:** the contract modules, `lib/markdown.ts`, `lib/utils.ts`, `app/layout.tsx`.
- **Must not touch:** list files, the data layer, `app/layout.tsx`, `next.config.mjs` (except temporary verification edits).
- **Work:**
  - Keep `generateStaticParams` returning every flat post.
  - Add `generateMetadata` returning:
    - `title: post.title` and `description: post.description`;
    - `alternates.canonical: articleUrl(post.slug)`;
    - for a labelled post, `alternates.languages`: one entry per version from `getArticleVersions(slug)`, keyed by `CONTENT_LANGUAGE[lang]` with value `articleUrl(slug)`. This includes the post itself, so the entries are reciprocal by construction. Unlabelled posts get canonical only.
  - Render `ArticleLanguageSwitch` near the `<h1>` only when there is more than one version. The current version is marked with `aria-current="page"` and is not a link. The other versions are `next/link` links to `/blog/<slug>/`, with `lang` and `hrefLang`.
  - Put `lang` on the `<h1>` and on the prose `<div>`, only for labelled posts. Keep the date shown as the version's own date.
- **Acceptance criteria:** 2 (switch), 7 (alternates from published versions only), 8, 9 (switch).

#### Task 2.3 — Contract documentation

- **Owns:** `docs/blog/content-sync.md` (article contract section), `.claude/skills/publish-post/SKILL.md` (frontmatter block and field notes), `reference/structure.md` and `README.md` (status lines that currently say the feature is unimplemented; update them only after Phase 3 passes).
- **Must not touch:** code, the spec, generated content.
- **Work:** Document optional `translationKey`: its format, that it requires `lang`, one published version per language, that it never changes a URL, and how to pair an existing article. State that publishing a translation remains a separate owner-approved action.
- **Acceptance criteria:** supports the spec's rollout step 2. No criterion maps directly.

### Phase 3 — Integration verification (single agent, owns no files permanently)

Run the generated-output checks and manual checks in the test plan below. All temporary edits are reverted, and `git status` must be clean afterward, apart from intended commits. Any defect found is handed back to the task that owns the file.

## Test plan mapped to acceptance criteria

### Data-boundary tests (`npm run test:blog`)

**`scripts/post-groups.test.mjs`** (pure, in-memory posts)

| Case | AC |
| --- | --- |
| Five posts, one zh/en pair (`translationKey: example`) plus three standalone, produce four articles. The pair's `versions` are ordered `[zh, en]`. `findArticleVersions` returns both versions for either slug, and `[]` for an unknown slug. | 2 |
| `harness-preface-zh` and an unkeyed `harness-preface-en` stay two articles. An unkeyed slug `example` and the key `example` stay separate (`slug:example` and `key:example`). | 2, 3 |
| A keyed post without `lang`, and two posts with the same key and lang, each throw from `assertValidPairing` and from `groupBlogPosts`. A key failing `slugPattern` (`Bad_Key`, `""`) fails `BlogPostSchema.parse`. | 3 |
| An unlabelled legacy post forms a standalone article and is selected under `'all'`. `selectVersion` returns `null` for both `'en'` and `'zh'`. | 3 |
| `selectVersion('all')` picks zh when both versions exist and en when only en exists. `'en'` picks en and never zh. | 4, 5 |
| Pair zh 2026-04-15 with en 2026-10-31, alongside another article dated 2026-05-01: the article date is 2026-04-15 and the order is unchanged by the later en version. An en version dated 2026-01-01 makes the date 2026-01-01 and changes the order. Removing the earliest version recomputes the date. Ties sort by `id`. | 4 |
| `filterArticles` applies AND. The tag matches the union (a tag present only on the en version also matches under `'zh'`). Counts are logical articles. An empty intersection returns `[]` while `collectTags` is unchanged. | 5 |
| `parseBlogFilters`: `lang=fr` gives `'all'`; `tag=Gone` gives `null`; `lang=en&tag=Gone` gives `en` and `null`. `blogFilterQuery` round-trips a tag containing spaces or non-ASCII characters (`Claude Code`, `演算法`) and returns `""` for All/All tags. | 6 |

**`scripts/sync-blog.test.mjs`** (Git fixtures; append cases only)

| Case | AC |
| --- | --- |
| Source has `harness/zh/a.md` and `harness/en/a.md` with the same key. The export keeps `translationKey` in both snapshot files. `readBlogPosts` returns both, and grouping them gives one article. An `internalNote` field is still stripped. | 2, 7 |
| Same key and lang published twice, which in a fixture means two files under `zh/` with different slugs, makes export throw and leave no manifest. A local legacy post that is keyed but has no `lang` makes export throw. An invalid key value makes export throw. | 3 |
| An unpublished en sibling with a unique tag `PRIVATE-TAG` and an earlier date produces a snapshot without its slug and without `PRIVATE-TAG`. The group's summary has one version, tags without `PRIVATE-TAG`, and the zh date. | 7 |
| Publish a pair, then set en to `published: false` and re-export: the en file is removed and the group drops to one version. Withdraw zh as well: the group disappears. (The existing link-to-withdrawn-article failure still applies.) | 7 |
| Re-exporting an unkeyed source produces byte-identical files, which guards key order. The existing "ignores private-only changes" test already covers this; confirm it still passes. | 1 |

**`scripts/post-files.test.mjs`** (hand-built snapshot in a temporary root)

| Case | AC |
| --- | --- |
| Four unkeyed zh snapshot files load unchanged and group into four articles. | 1 |
| A snapshot with two files sharing key and lang makes `readBlogPosts` throw, so the build fails. | 3 |
| `BlogService` is not tested directly (TypeScript); it is a thin composition of tested functions. | — |

### Generated-output checks (Phase 3)

`next build` cannot download Sora in this environment. Before building, apply two temporary edits:

1. In `app/layout.tsx`, replace the `next/font/google` import and the `Sora(...)` call with `const sans = { variable: "" };`.
2. In `next.config.mjs`, add `basePath: '/yusa-CV'`. This stands in for what `configure-pages` injects in CI.

Then run:

```sh
NEXT_PUBLIC_BASE_PATH=/yusa-CV npx next build
```

Revert both edits afterward and confirm with `git diff --exit-code app/layout.tsx next.config.mjs`. Also run one build without the base path (root build), with only the font stub applied.

| Check on `out/` | AC |
| --- | --- |
| `out/blog/index.html` (fallback HTML) contains exactly four card title links to `/yusa-CV/blog/<slug>/` for the four current slugs. `out/blog/<slug>/index.html` exists for each slug. | 1, 10 |
| `grep -r '/yusa-CV/yusa-CV' out` finds nothing. `grep -o 'href="/blog/' out/blog/index.html` finds nothing in the base-path build. The existing snapshot image in `harness-preface-zh` still resolves to `/yusa-CV/images/synced-blog/...`. | 10 |
| Each article page has `<link rel="canonical" href="https://yusaanthya.github.io/yusa-CV/blog/<slug>/">`. In the root build the canonical is `https://yusaanthya.github.io/blog/<slug>/`. Current labelled single versions have no hreflang alternates for other languages, only their own entry. | 8 |
| `lang="zh-Hant"` appears on the article `<h1>` and prose. `<html lang="en">` and the navigation are unchanged. | 8 |
| `npm run lint` passes. | — |

**Pair verification (AC2, AC8 with a pair).** This uses a disposable copy and never touches the working checkout:

1. Copy the repository into the scratchpad.
2. In the copy, add a synthetic fixture: a `harness-preface-en` file and the `translationKey` on both files, with an updated manifest. Alternatively, run `syncBlog` against a temporary fixture source repository so the snapshot is generated rather than hand-written.
3. Build the copy with the same temporary edits.
4. Check that there are five routes and four cards, that the alternates are reciprocal (each page lists both `zh-Hant` and `en` absolute URLs), and that the switch and card language links point to the right slug.
5. Delete the copy.

Do not commit any synthetic content.

### Manual browser checks (Phase 3)

Serve the base-path export at the `/yusa-CV` prefix: create a scratchpad directory containing a symlink `yusa-CV -> <repo>/out`, run `python3 -m http.server 8080 -d <that dir>`, and open `http://localhost:8080/yusa-CV/blog/`. Use the paired copy's `out/` for the bilingual checks.

| Check | AC |
| --- | --- |
| Choosing a filter updates the URL to `/yusa-CV/blog/?lang=en&tag=…`. Refresh, opening the copied URL in a new tab, Back/Forward, and opening an article then pressing Back all restore the controls and results. `?lang=fr&tag=Nope` shows All/All tags without errors. An empty intersection shows the message, and Clear filters restores the full list. | 6 |
| Under `English`, no Chinese title is shown. Tag options do not change when the language changes. | 5 |
| Tab order reaches the language controls, tag select, card title links, and card language links separately. A language link is not swallowed by the stretched link (click it and check the destination). Focus is visible. Repeat at a 375px width and in both themes. | 9 |
| With JavaScript disabled: the full list and all version links work, and filter controls are absent. | 10 |
| The article switch shows the current language and navigates. A single-language article has no switch. | 2, 9 |

## Risks

1. **Stretched card link covering language links.** `post-card.tsx` puts `after:absolute after:inset-0` on the title link, and that pseudo-element covers the whole card, including any later sibling. Language links need `relative z-10` (or equivalent) and must be siblings of the title link, not children, to avoid nested `<a>` elements. The card's `has-[:focus-visible]` outline also lights up when a language link has focus. Each language link should keep its own focus style, so it is clear which control is focused.
2. **`useSearchParams` in static export.** Without a `<Suspense>` boundary, `next build` fails (`missingSuspenseWithCSRBailout`). Inside one, the exported HTML contains only the fallback, so the fallback must be the full working list (AC10). The cost: a deep link such as `?lang=en` briefly shows the unfiltered list until hydration. This is acceptable within the spec.
3. **Base path divergence.** Next's `basePath` (injected by CI, which affects links and the router) and `NEXT_PUBLIC_BASE_PATH` (used by `assetPath` and `articleUrl`) come from the same CI value but are separate settings. A local build that sets only one gives inconsistent URLs. Verification must set both, as described above. Using `router.push` with an already-prefixed path, or wrapping `Link` hrefs in `assetPath`, causes double prefixes. The query-only `pushState` approach avoids both mistakes.
4. **Existing snapshots must keep validating unchanged.** `translationKey` must go last in the schema shape and stay optional. Otherwise the next export reorders keys in all four snapshot files and produces a spurious content commit. Pairing validation in the reader runs for every build, so a malformed future snapshot fails the deploy instead of being skipped. That is the intended behavior.
5. **Pairing check covering local legacy posts.** The reader groups local and imported posts together, so the exporter must validate the same combined set. Otherwise a legacy local post could pass export and then fail the build. `content/posts/` is absent today, so this is a latent issue rather than an active one.
6. **The `zh` fallback in `'all'` assumes two languages.** `selectVersion` chooses zh, then en, then the single unlabelled version. This is correct for the current enum. Adding a third language would require revisiting it; that is out of scope.
7. **Article page `<title>` changes.** Article pages currently inherit the root title "Yusa Liu | Backend Engineer". Version-specific metadata (required by the spec) replaces it with the article title. This is a visible change, though not a regression.
8. **Repeated reads.** `readBlogPosts` re-reads every file each time it is called (list, params, each article, now also versions). That is fine for four posts, and no caching is planned.

## Open questions

None of these blocks implementation. Each has a recommended default that implementers should apply unless the owner says otherwise.

1. **Synthetic pair for generated-output verification.** The rule against hand-editing `content/synced-posts/` applies to the repository. *Default:* run the AC2/AC8 pair build only in a disposable scratchpad copy, preferably with a snapshot generated by `syncBlog` from a temporary fixture source. Never commit it.
2. **Single-language card affordance.** The spec requires the language to be "identified". *Default:* a plain text label (`繁體中文` or `English`) for single-version articles, and links only when there are two versions. This avoids a redundant tab stop.
3. **Article `<title>` format.** *Default:* `post.title` alone, with no added root `title.template`. Adding a site suffix would be a separate owner decision.
4. **Local base-path verification mechanism.** *Default:* a temporary `basePath` edit in `next.config.mjs`, reverted afterward. Do not make `next.config.mjs` read an environment variable permanently, because `configure-pages` already owns that injection in CI.
5. **Tag option order.** *Default:* case-insensitive alphabetical (`collectTags`). Tags within a card keep first-seen order, which follows the source order of each version.
