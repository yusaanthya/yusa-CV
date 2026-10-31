# Bilingual Blog Articles and Filters — Implementation Plan

> Created: 2026-10-31
> Status: Proposed for owner review; revised 2026-10-31 for the language-toggle and tag-picker decisions
> Spec: [2026-10-31-bilingual-articles-and-filters-spec.md](./2026-10-31-bilingual-articles-and-filters-spec.md)
> Code baseline: `dd166b536761433fb490b454f38901fde87f69ae` (`main`)

## Scope and baseline

This plan implements the spec as revised on 2026-10-31. These owner decisions are requirements:

- Every logical article is always listed. A two-state display toggle (`中文` ⇄ `EN`) picks which version each card shows, falling back to the other language when the selected one is missing. The default comes from the browser language.
- The tag filter is a single-select searchable picker (custom popover) with logical-article counts.
- Tag filtering matches the union of tags across a group's published versions.
- Lists are ordered by the earliest date among the currently published versions.

The spec's "Applied defaults" table (browser rule, URL precedence, Chinese-first static output, fallback visibility, toggle-independent counts, list-only scope, ordering) is also binding unless the owner changes it; see Open questions.

The spec was written against `fc3a975`. Between that commit and `dd166b5`, the only changes were to documentation, ESLint configuration (`.eslintrc.json`, the `lint` script) and `tailwind.config.ts`. Nothing changed under `features/`, `scripts/`, `app/` or `lib/`, so the "Verified current behavior" table in the spec still describes the code.

Baseline facts this plan relies on:

- **Snapshot:** `content/synced-posts/` holds four published variants: `harness-preface-zh`, `leetcode-3sum`, `leetcode-container-with-max-water` and `sign-key-disassemble`. All four have `lang: zh` and none has a translation key. `content/posts/` (legacy) is absent, but the reader still supports it.
- **Metadata contract:** `BlogPostSchema` is a plain `z.object`. `ImportedPostSchema` extends it with `.extend()`, and `post-files.mjs` reads `BlogPostSchema.shape.slug`. The schema therefore has to stay a `ZodObject`; wrapping it in `.refine`/`.superRefine` would break both uses.
- **Exporter output:** The exporter writes `matter.stringify(body, metadata)`, where `metadata` is the Zod-parsed object. Zod strips unknown keys, so a key added to the schema is carried through automatically and other source keys stay excluded. Zod also emits keys in schema shape order, and absent optional keys are not emitted. Snapshots without a key therefore stay byte-identical as long as the new key is added at the end of the shape.
- **Base path:** `next.config.mjs` has no `basePath`. In CI, `actions/configure-pages` (`static_site_generator: next`) injects it, and the workflow sets `NEXT_PUBLIC_BASE_PATH` from the same value. `next/link` and `router.push` add the base path to hrefs automatically. `assetPath()` in `lib/utils.ts` adds `NEXT_PUBLIC_BASE_PATH` by hand, for strings that Next does not prefix.
- **Router:** Next is `14.2.14`, with `output: 'export'` and `trailingSlash: true`. `missingSuspenseWithCSRBailout` defaults to `true`, so `useSearchParams()` without a `<Suspense>` boundary fails the static build. The App Router patches `window.history.pushState` and keeps `useSearchParams()` in sync with it (window history support has been stable since 14.1).
- **Tests:** `npm run test:blog` runs `node --test scripts/sync-blog.test.mjs`. The test helpers create temporary Git source repositories and site roots under `os.tmpdir()`. Pure data logic lives in `.mjs` files with JSDoc so that `node --test` can import it without a TypeScript loader. CI uses Node 20; the local environment has Node 22.

Out of scope, as in the spec: whole-site localization, an i18n framework, publishing any translation, editing source articles, multi-tag selection, full-text search (the tag picker's tag-name search is in scope), persisting the language choice beyond the URL, pagination, RSS/sitemap, and any change to workflows or credentials.

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

/** List display language. Always one of the two; there is no "all" state. */
export type BlogDisplayLang = BlogLang;

/** List state as read from the URL. `lang: null` = use the browser default; `tag: null` = all tags. */
export interface BlogListState { lang: BlogDisplayLang | null; tag: string | null }

/** One card as rendered: the logical article plus the version it displays. */
export interface BlogListEntry { article: BlogArticleSummary; version: BlogArticleVersion }

export interface BlogTagCount { tag: string; count: number } // count = logical articles
```

### Grouping, display selection, tags and URL state (`features/blog/services/post-groups.mjs`, new, pure)

Each function has JSDoc types that reference `../types`.

| Export | Signature | Behavior |
| --- | --- | --- |
| `assertValidPairing` | `(posts: Pick<BlogPost,'slug'\|'lang'\|'translationKey'>[]) => void` | Throws if a keyed post has no `lang`, or if two posts share a key/lang pair. Error messages name the slug(s) and the key. The exporter and the reader both call it. |
| `groupBlogPosts` | `(posts: BlogPost[]) => BlogArticleSummary[]` | Calls `assertValidPairing` first. Groups by explicit key; unkeyed posts become standalone articles. Derives `date` and `tags`. Sorts by `date` descending, then `id` ascending. |
| `findArticleVersions` | `(articles: BlogArticleSummary[], slug: string) => BlogArticleVersion[]` | Returns the published versions of the article containing `slug` (including that slug), or `[]` if the slug is not found. |
| `STATIC_DISPLAY_LANG` | `'zh'` | Display language of the exported HTML, the no-JavaScript page and the server snapshot before hydration. |
| `detectPreferredLang` | `(languages: readonly string[]) => BlogDisplayLang` | Scans in order and returns `'zh'` or `'en'` for the first entry whose primary subtag (before the first `-`, case-insensitive) is `zh` or `en`. Returns `'en'` if neither appears, including for `[]`. |
| `selectVersion` | `(article: BlogArticleSummary, lang: BlogDisplayLang) => BlogArticleVersion` | Never returns `null`. Returns the version in `lang`, else the version in the other language, else `versions[0]` (an unlabelled legacy post). |
| `listArticles` | `(articles, lang: BlogDisplayLang, tag: string \| null) => BlogListEntry[]` | Keeps articles whose tag union contains `tag` (all when `null`), each with `selectVersion(article, lang)`. Preserves input order. Never drops an article because of `lang`. |
| `countTags` | `(articles: BlogArticleSummary[]) => BlogTagCount[]` | One entry per distinct tag with the number of logical articles carrying it (a pair counts once). Sorted with `localeCompare(…, 'en', { sensitivity: 'base' })`. Takes no language argument. |
| `matchTags` | `(tags: BlogTagCount[], query: string) => BlogTagCount[]` | Picker search: case-insensitive substring match on the tag name after trimming `query`; an empty query returns all. Preserves order. |
| `parseBlogListState` | `(params: URLSearchParams, availableTags: string[]) => BlogListState` | `lang` other than `zh`/`en` becomes `null` (browser default). A `tag` not in `availableTags` becomes `null`. The two fall back independently. |
| `blogListQuery` | `(state: BlogListState) => string` | Returns `""` when both are `null`. Otherwise returns `?lang=…&tag=…`, built with `URLSearchParams`, omitting `null` keys. |
| `LANGUAGE_LABELS` | `{ zh: '中文', en: 'EN' }` | Label text for the toggle and card language labels. |
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
  - Implement every `post-groups.mjs` export exactly as listed in the contract, including `STATIC_DISPLAY_LANG`, `LANGUAGE_LABELS` and `CONTENT_LANGUAGE`. `detectPreferredLang` takes the language list as an argument and never reads `navigator`, so it stays testable under `node --test`.
  - Add the types and the `lib/site.ts` helpers.
  - Write pure unit tests on in-memory post arrays (cases listed in the test plan).
- **Acceptance criteria:** 2, 3, 4 (detection, fallback, dates), 5 (matching and counts) and the parsing/serializing part of 6, at the data boundary. Provides the foundation for 7 and 8.

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

#### Task 2.1 — Grouped list, cards, language toggle, tag picker

- **Owns:** `app/blog/page.tsx`, `features/blog/components/post-card.tsx`, `features/blog/components/article-list.tsx` (new, server-safe, no hooks), `features/blog/components/blog-list.tsx` (new, `"use client"`, owns URL state), `features/blog/components/language-toggle.tsx` (new, `"use client"`), `features/blog/components/tag-picker.tsx` (new, `"use client"`).
- **Reads:** the contract modules, `features/ui/components/tag-list.tsx`, `lib/utils.ts`, `nav-links.tsx` and `theme-toggle.tsx` (existing client component conventions), `app/globals.css`, `tailwind.config.ts`.
- **Must not touch:** `app/blog/[slug]/page.tsx`, the data layer, `app/layout.tsx`, `next.config.mjs` (except temporary verification edits, which must be reverted).
- **Work:**
  - **`page.tsx`:** Load `articles = await BlogService.getArticleSummaries()` and `tagCounts = countTags(articles)`. Render:

    ```tsx
    <Suspense fallback={<ArticleList entries={listArticles(articles, STATIC_DISPLAY_LANG, null)} />}>
      <BlogList articles={articles} tagCounts={tagCounts} />
    </Suspense>
    ```

    The fallback is what the exported HTML contains: the full Chinese-first list with working links and no controls. That is the no-JavaScript state, so it satisfies AC10. Pass only `BlogArticleSummary[]` and `BlogTagCount[]` to the client component.
  - **`blog-list.tsx`:**
    - Read `{ lang, tag }` with `useSearchParams()` and `parseBlogListState` (available tags from `tagCounts`).
    - Read the browser default with `useSyncExternalStore(subscribe, () => detectPreferredLang(navigator.languages), () => STATIC_DISPLAY_LANG)`, where `subscribe` listens for the `languagechange` event. The snapshot is a string, so it is stable between renders; the server snapshot matches the static fallback.
    - `displayLang = lang ?? browserLang`. Derive entries with `listArticles(articles, displayLang, tag)` and render `<LanguageToggle>`, `<TagPicker>`, the listed-article count, and `<ArticleList>`.
    - Update the URL with `window.history.pushState(null, "", query || window.location.pathname)`, where `query = blogListQuery(next)`. A toggle sets `next = { lang: chosen, tag }` (always explicit, even when equal to the browser default). A tag change sets `next = { lang, tag: chosen }`, keeping `lang` as it was, possibly `null`. A query-only relative URL keeps whatever base path is already in the location, so the prefix can never be doubled or dropped. Next 14.2 syncs `useSearchParams` with pushState, and each change creates a history entry. Do not keep list state in separate React state; the URL plus the browser default is the single source of truth, which makes Back/Forward, refresh and copied URLs work without extra code.
    - Show the listed-article count in an `aria-live="polite"` element. No empty-result state: every offered tag matches at least one article, and an unknown URL tag already parses to `null`.
  - **`language-toggle.tsx`:** Props `{ value: BlogDisplayLang; onChange(lang) }`. A `role="group"` with `aria-label="Article language"` holding two `<button type="button">`s, `中文` (with `lang="zh-Hant"`) and `EN`, each with `aria-pressed`. Mark the pressed one with something other than color alone (weight plus underline, following `nav-links.tsx`). Pressing the active button does nothing.
  - **`tag-picker.tsx`:** Props `{ options: BlogTagCount[]; selected: string | null; onSelect(tag: string | null) }`.
    - Trigger: a `<button>` with `aria-haspopup="listbox"`, `aria-expanded` and a visible label `Tags ▾`, or the selected tag. When a tag is selected, render a separate sibling `<button aria-label="Clear tag filter">✕</button>`, never nested in the trigger; it calls `onSelect(null)` and moves focus to the trigger.
    - Panel: a search `<input>` with `role="combobox"`, `aria-controls` pointing at a `role="listbox"`, and `aria-activedescendant` naming the active option. Options are `matchTags(options, query)`; each is `role="option"` with `aria-selected`, the tag name, its count, and a check icon when selected (the check plus `aria-selected` carry the selection, not color). An empty search result shows "No matching tags." inside the panel.
    - Keyboard: Enter or Space on the trigger toggles the panel and, on open, focuses the search input with the selected option (or the first) active. Arrow Up/Down move the active option (Home/End optional). Enter selects the active option. Esc closes. Selecting and Esc both close the panel and return focus to the trigger. Tab out of the panel or a pointer press outside it closes the panel without changing the selection. Reset the search text when the panel closes.
    - Layout: an absolutely positioned popover under the trigger from the `sm` breakpoint up. Below `sm`, a bottom sheet (`fixed inset-x-0 bottom-0`, with a backdrop that closes it on press) with the same markup and keyboard behavior. Use the existing `surface`, `line`, `ink`, `mute` and `accent` tokens so both themes work.
    - Multi-select later: keep option rendering and keyboard handling independent of how many tags are selected, so a future multi mode only changes the selection callback and adds `aria-multiselectable`. Do not build it now.
  - **`post-card.tsx`:** Change the props to `{ article: BlogArticleSummary; version: BlogArticleVersion }` (one `BlogListEntry`).
    - Show `article.date`, not the version's own date.
    - The title link goes to `/blog/${version.slug}/` and keeps the stretched `after:absolute after:inset-0` link.
    - When the article has more than one version, render a language link list as a sibling of the `<h2>`, never nested inside the title link. Each link: `href=/blog/<slug>/`, `lang` and `hrefLang` from `CONTENT_LANGUAGE`, label from `LANGUAGE_LABELS`, and `aria-current="true"` plus a non-color marker (weight or underline) on the displayed version. Give the link list `relative z-10` so the stretched link does not cover it.
    - When the article has a single labelled version, show a plain language label, not a link. Because it is always the displayed version, a fallback (a Chinese-only card under `EN`) is visible from the label.
    - Unlabelled legacy posts show no language label.
    - Put `lang={CONTENT_LANGUAGE[version.lang]}` on the title and the description (not the whole card), only when the version has a `lang`.
    - Tags show `article.tags`.
  - **`article-list.tsx`:** Takes `BlogListEntry[]` and renders the existing `<ul className="flex flex-col gap-3">` of `PostCard`s. Both the server fallback and `BlogList` use it.
- **Acceptance criteria:** 1, 2 (card links), 4 and 5 (display and picker counts), 6, 9 (list controls), 10.

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

- **Owns:** `docs/blog/content-sync.md` (article contract section), `.claude/skills/publish-post/SKILL.md` (frontmatter block and field notes), `reference/structure.md` and `README.md` (status lines that currently say the feature is unimplemented).
- **Must not touch:** code, the spec, generated content.
- **Work, in two steps:**
  1. *Parallel with Tasks 2.1 and 2.2:* document optional `translationKey` in `content-sync.md` and the publishing skill: its format, that it requires `lang`, one published version per language, that it never changes a URL, and how to pair an existing article. State that publishing a translation remains a separate owner-approved action.
  2. *After Phase 3 passes:* update the completion-status lines in `README.md` and `reference/structure.md`, then recheck the final diff of the whole feature against these status claims.
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
| An unlabelled legacy post forms a standalone article; `selectVersion` returns its only version for both `'zh'` and `'en'`, and `listArticles` keeps it under both. | 3 |
| `detectPreferredLang`: `['zh-TW','en']` → `zh`; `['en-US','zh-TW']` → `en`; `['ZH-hant']` → `zh`; `['fr-FR','zh-CN']` → `zh`; `['fr-FR']` → `en`; `[]` → `en`; `['zhx','en']` → `en` (primary subtag must equal `zh`). | 4 |
| `selectVersion` on a pair returns zh for `'zh'` and en for `'en'`. On a zh-only article it returns zh for both; on an en-only article, en for both. It never returns `null`. | 4 |
| `listArticles` with the four current zh-only articles returns four entries, all zh, under both `'zh'` and `'en'`, in the same order. With a pair added, `'en'` shows the pair's en version and the others' zh versions. | 1, 4 |
| Pair zh 2026-04-15 with en 2026-10-31, alongside another article dated 2026-05-01: the article date is 2026-04-15 and the order is unchanged by the later en version. An en version dated 2026-01-01 makes the date 2026-01-01 and changes the order. Removing the earliest version recomputes the date. Ties sort by `id`. | 4 |
| `listArticles` tag matching uses the union (a tag present only on the en version also matches under `'zh'`, displaying zh). `countTags` on the four current articles gives `LeetCode: 2`, `Arrays: 2`, `Two Pointers: 2` and 1 for each other tag; a pair whose versions both carry `Harness` counts 1. For every tag, its count equals `listArticles(…, lang, tag).length` under both languages. | 5 |
| `matchTags`: `'two'` matches `Two Pointers`; `'  LEET '` matches `LeetCode`; `'演算'` matches a fixture tag `演算法`; `''` returns all; `'zzz'` returns `[]`. | 9 |
| `parseBlogListState`: no params gives `{ lang: null, tag: null }`; `lang=fr` gives `lang: null`; `tag=Gone` gives `tag: null`; `lang=en&tag=Gone` gives `en` and `null`; `lang=zh&tag=LeetCode` keeps both. `blogListQuery` round-trips a tag containing spaces or non-ASCII characters (`Claude Code`, `演算法`), omits `lang` when it is `null`, and returns `""` when both are `null`. | 6 |

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

`next build` cannot download Sora in this environment. The stubbed builds below are isolated integration checks of routes, links and metadata; they do not build the exact shipped source. The real build and deploy evidence is an unmodified production build: run locally where network access permits, or else the Pages CI run on the final implementation commit.

Before building, apply two temporary edits:

1. In `app/layout.tsx`, replace the `next/font/google` import and the `Sora(...)` call with `const sans = { variable: "" };`.
2. In `next.config.mjs`, add `basePath: '/yusa-CV'`. This stands in for what `configure-pages` injects in CI.

Then run:

```sh
NEXT_PUBLIC_BASE_PATH=/yusa-CV npx next build
```

Revert both edits afterward and confirm with `git diff --exit-code app/layout.tsx next.config.mjs`. Also run one build without the base path (root build), with only the font stub applied.

| Check on `out/` | AC |
| --- | --- |
| `out/blog/index.html` (fallback HTML) contains exactly four card title links to `/yusa-CV/blog/<slug>/` for the four current slugs, Chinese-first, and no toggle or picker markup. `out/blog/<slug>/index.html` exists for each slug. | 1, 10 |
| `grep -r '/yusa-CV/yusa-CV' out` finds nothing. `grep -o 'href="/blog/' out/blog/index.html` finds nothing in the base-path build. The existing snapshot image in `harness-preface-zh` still resolves to `/yusa-CV/images/synced-blog/...`. | 10 |
| Each article page has `<link rel="canonical" href="https://yusaanthya.github.io/yusa-CV/blog/<slug>/">`. In the root build the canonical is `https://yusaanthya.github.io/blog/<slug>/`. Current labelled single versions have no hreflang alternates for other languages, only their own entry. | 8 |
| `lang="zh-Hant"` appears on the article `<h1>` and prose. `<html lang="en">` and the navigation are unchanged. | 8 |
| `npm run lint` passes. | — |

**Pair verification (AC2, AC8 with a pair).** This uses a disposable copy and never touches the working checkout:

1. Copy the repository into the scratchpad.
2. In the copy, add a synthetic fixture: a `harness-preface-en` file and the `translationKey` on both files, with an updated manifest. Alternatively, run `syncBlog` against a temporary fixture source repository so the snapshot is generated rather than hand-written.
3. Build the copy with the same temporary edits.
4. Check that there are five routes and four cards, that the fallback HTML shows the pair's zh title, that the alternates are reciprocal (each page lists both `zh-Hant` and `en` absolute URLs), and that the switch and card language links point to the right slug.
5. Delete the copy.

Do not commit any synthetic content.

### Manual browser checks (Phase 3)

Serve the base-path export at the `/yusa-CV` prefix: create a scratchpad directory containing a symlink `yusa-CV -> <repo>/out`, run `python3 -m http.server 8080 -d <that dir>`, and open `http://localhost:8080/yusa-CV/blog/`. Use the paired copy's `out/` for the bilingual checks.

| Check | AC |
| --- | --- |
| Browser default: with the browser language list set to `zh-TW, en` (Chrome language settings, a fresh profile, or the DevTools Sensors locale override), `/yusa-CV/blog/` opens with `中文` pressed; with `en-US` it opens with `EN` pressed; with `fr-FR` only, `EN`. Confirm what the page sees with `navigator.languages` in the console. | 4 |
| Toggle and fallback (paired copy): under `EN` the pair shows its English title and its `EN` label is marked current; the other three cards still show Chinese with `中文` marked; no card disappears and the order is unchanged. Under `中文` the pair shows Chinese. On the real export, all four cards show Chinese under both states. | 1, 4 |
| URL override and history: with an `en` browser, opening `?lang=zh` shows `中文`; toggling writes `?lang=…`; choosing a tag writes `tag` and keeps `lang`. Refresh, opening the copied URL in a new tab, Back/Forward through toggle and tag changes, and opening an article then pressing Back all restore the toggle, tag and results. `?lang=fr&tag=Nope` shows the browser default and all tags without errors. | 6 |
| Paired copy, with an `en` browser: opening `/yusa-CV/blog/` shows the Chinese-first fallback briefly, then the client choice; the swap happens once with no console hydration warnings. Opening an article page never redirects. | 4, 10 |
| Tag picker counts: each option's count matches the cards listed after selecting it, and options and counts are identical under both toggle states. The clear control returns to all tags. | 5 |
| Tag picker keyboard flow: Tab to the trigger, Enter opens with focus in the search field; typing `two` narrows to `Two Pointers`; arrow keys move the active option (screen reader or the accessibility tree announces it); Enter selects, the panel closes, focus returns to the trigger, and the trigger shows the tag with a ✕. Space reopens; the selected option shows a check. Esc closes and returns focus. Tab out or a click outside closes without changing the selection. | 9 |
| Tab order reaches the toggle buttons, picker trigger, clear control, card title links, and card language links separately. A language link is not swallowed by the stretched link (click it and check the destination). Focus is visible on every control. | 9 |
| At a 375px width the panel presents as a bottom sheet, the same keyboard flow works, the backdrop closes it, and there is no horizontal scroll. Repeat the toggle and picker checks in light and dark themes. | 9 |
| With JavaScript disabled: the full Chinese-first list and all version links work, and the toggle and picker are absent. | 10 |
| The article switch shows the current language and navigates. A single-language article has no switch. | 2, 9 |

## Risks

1. **Stretched card link covering language links.** `post-card.tsx` puts `after:absolute after:inset-0` on the title link, and that pseudo-element covers the whole card, including any later sibling. Language links need `relative z-10` (or equivalent) and must be siblings of the title link, not children, to avoid nested `<a>` elements. The card's `has-[:focus-visible]` outline also lights up when a language link has focus. Each language link should keep its own focus style, so it is clear which control is focused.
2. **`useSearchParams` in static export.** Without a `<Suspense>` boundary, `next build` fails (`missingSuspenseWithCSRBailout`). Inside one, the exported HTML contains only the fallback, so the fallback must be the full working list (AC10). The cost: a deep link such as `?tag=Harness` briefly shows the full list until hydration. This is acceptable within the spec.
3. **Base path divergence.** Next's `basePath` (injected by CI, which affects links and the router) and `NEXT_PUBLIC_BASE_PATH` (used by `assetPath` and `articleUrl`) come from the same CI value but are separate settings. A local build that sets only one gives inconsistent URLs. Verification must set both, as described above. Using `router.push` with an already-prefixed path, or wrapping `Link` hrefs in `assetPath`, causes double prefixes. The query-only `pushState` approach avoids both mistakes.
4. **Existing snapshots must keep validating unchanged.** `translationKey` must go last in the schema shape and stay optional. Otherwise the next export reorders keys in all four snapshot files and produces a spurious content commit. Pairing validation in the reader runs for every build, so a malformed future snapshot fails the deploy instead of being skipped. That is the intended behavior.
5. **Pairing check covering local legacy posts.** The reader groups local and imported posts together, so the exporter must validate the same combined set. Otherwise a legacy local post could pass export and then fail the build. `content/posts/` is absent today, so this is a latent issue rather than an active one.
6. **Fallback assumes two languages.** `selectVersion` chooses the requested language, then the other one, then the single unlabelled version, and `detectPreferredLang` only recognizes `zh` and `en`. This is correct for the current enum. A third language would need a fallback order; that is out of scope.
7. **Article page `<title>` changes.** Article pages currently inherit the root title "Yusa Liu | Backend Engineer". Version-specific metadata (required by the spec) replaces it with the article title. This is a visible change, though not a regression.
8. **Repeated reads.** `readBlogPosts` re-reads every file each time it is called (list, params, each article, now also versions). That is fine for four posts, and no caching is planned.
9. **Hydration swap.** The exported HTML is Chinese-first, so a visitor whose URL or browser choice is `EN` sees paired cards change text once after hydration. The spec accepts this. Keep it to a text change: do not compute the browser default during a server render or in a way that differs between the server snapshot and the first client render (use the `useSyncExternalStore` server snapshot), or React reports a hydration mismatch. Today no article has an English version, so no visible swap occurs until a translation is published.
10. **Popover accessibility and focus management.** A custom listbox is easy to get subtly wrong: focus lost to `<body>` on close, the clear button nested inside the trigger, `aria-activedescendant` pointing at a filtered-out option, the stretched card link or a bottom-sheet backdrop trapping clicks, or the sheet leaving page scroll active behind it. Follow the keyboard rules in Task 2.1 exactly, reset the active option when the search text changes, verify with the keyboard and the browser accessibility tree in Phase 3, and do not add a dependency for this unless the owner approves one.

## Open questions

None of these blocks implementation. Each has a recommended default that implementers should apply unless the owner says otherwise.

1. **Synthetic pair for generated-output verification.** The rule against hand-editing `content/synced-posts/` applies to the repository. *Default:* run the AC2/AC8 pair build only in a disposable scratchpad copy, preferably with a snapshot generated by `syncBlog` from a temporary fixture source. Never commit it.
2. **Single-language card affordance.** The spec requires the language to be "identified". *Default:* a plain text label (`中文` or `EN`, matching the toggle) for single-version articles, and links only when there are two versions. This avoids a redundant tab stop.
3. **Article `<title>` format.** *Default:* `post.title` alone, with no added root `title.template`. Adding a site suffix would be a separate owner decision.
4. **Local base-path verification mechanism.** *Default:* a temporary `basePath` edit in `next.config.mjs`, reverted afterward. Do not make `next.config.mjs` read an environment variable permanently, because `configure-pages` already owns that injection in CI.
5. **Tag option order.** *Default:* case-insensitive alphabetical (`countTags`), not by count. Tags within a card keep first-seen order, which follows the source order of each version.

The spec's applied defaults, which the owner did not state and may change, are implemented as follows:

| | Applied default | Where |
| --- | --- | --- |
| a | First `navigator.languages` entry with primary subtag `zh` or `en` decides; otherwise `EN`. | `detectPreferredLang` |
| b | A valid `?lang=zh\|en`, written on every toggle with a history entry, overrides the browser default; absent or invalid means browser default. No local storage or cookie. | `parseBlogListState`, `blog-list.tsx` |
| c | Static and no-JavaScript output are Chinese-first; the client choice applies after hydration (one possible swap). | `STATIC_DISPLAY_LANG`, Risk 9 |
| d | Cards identify their languages; the displayed version's label is marked current, which shows a fallback. Card language links stay direct version links. | `post-card.tsx` |
| e | Tag counts are logical-article counts, independent of the toggle; matching is "has the tag". The empty-result message and `Clear filters` are removed because no empty result is reachable. | `countTags`, `listArticles` |
| f | The toggle affects the list page only. Article pages keep their switch and never redirect; canonical, hreflang and `lang` rules are unchanged. | Task 2.2 unchanged |
| g | Order is the earliest published version's date, descending. | `groupBlogPosts` |
