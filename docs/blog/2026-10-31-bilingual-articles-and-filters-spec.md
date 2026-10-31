# Bilingual Blog Articles and Filters — Specification

> Created: 2026-10-31  
> Status: Proposed for owner review; documentation only  
> Code baseline: `fc3a9752a2ca78b5bb34c9ea6e2e1dd95ed83dcb`  
> Scope: Article identity, language variants, language and tag filters

## Intent and authority

Readers can discover an article once and read its available Chinese or English
version. Publishing a translation adds a reading option, not another article
card. The portfolio, CV, projects, and shared navigation remain English.

The owner requested a spec, independent review, and a pull request. This PR
does not implement the feature, publish articles, or approve a translation for
publication. Approval of this design is the input to later implementation
planning; the existing Markdown-rendering proposal and tasks remain separate.

The agreed product scope is:

- One logical article and one list card across its language versions.
- Existing Chinese-only articles remain valid and visible in the default list.
- Language filtering, single-tag filtering, and switching between published
  versions of the same article.
- Separate source Markdown files in `blog-post`, stable version URLs, and
  English site chrome.

The following are design choices proposed in this PR, not previously confirmed
owner decisions: Chinese-first display in `All`, shared tag filtering through
the union of published versions' tags, and list ordering by the earliest
currently published version's date. Their exact behavior is defined below.

## Verified current behavior

Paths in this section describe the inspected baseline, not proposed APIs.

| Area | Current behavior and evidence |
| --- | --- |
| Metadata | [`BlogPostSchema`](../../features/blog/schema.mjs) has a unique route `slug`, title, description, date, tags, publication flag, and optional `lang`; imported posts require `zh` or `en`. There is no translation identity field. |
| Public snapshot | [`manifest.json`](../../content/synced-posts/manifest.json) contains four variant slugs, all currently Chinese. Three retain their original language-neutral slugs. |
| Publication | [`syncBlog`](../../scripts/sync-blog.mjs) reads committed source content, exports only explicitly published source articles, validates metadata, and serializes the parsed metadata. Merely adding an unknown frontmatter field does not make it part of the exported contract. |
| Reading | [`readBlogPosts` and `readBlogPost`](../../features/blog/services/post-files.mjs) validate the snapshot and expose individual variants; local legacy posts remain supported. Sorting is currently by variant date descending, then slug. |
| Listing | [`app/blog/page.tsx`](../../app/blog/page.tsx) renders one [`PostCard`](../../features/blog/components/post-card.tsx) per variant without filters. |
| Detail pages | [`app/blog/[slug]/page.tsx`](../../app/blog/[slug]/page.tsx) generates a static route for every published variant and loads the body by slug. |
| Hosting | [`next.config.mjs`](../../next.config.mjs) uses static export. The [Pages workflow](../../.github/workflows/deploy.yml) injects the deployment base path and sets `NEXT_PUBLIC_BASE_PATH`; [`lib/utils.ts`](../../lib/utils.ts) and [`lib/markdown.ts`](../../lib/markdown.ts) already handle specific asset and Markdown-link prefixes. |

The [content synchronization contract](./content-sync.md) remains authoritative
for source ownership, explicit publication, generated snapshots, and credentials.

## Approaches

| Approach | Tradeoff | Decision |
| --- | --- | --- |
| Group published variants by explicit metadata; retain per-version URLs | Adds one content field and a grouped list view while preserving existing routes and authoring | Selected direction from the feature discussion |
| Infer pairs from filename or slug suffixes | Smaller metadata edit, but existing unsuffixed slugs and future renames make identity unreliable | Rejected |
| Introduce whole-site locale routes and translated site chrome | Provides full-site localization, but requires unrelated content and route migration | Outside the agreed scope |

## Content contract and identity

1. Add optional `translationKey` to the article metadata contract. A supplied
   value is a nonempty, lowercase kebab-case identifier using the existing slug
   character convention. It identifies the logical article; it never chooses
   or changes a URL.
2. Published variants with the same explicit `translationKey` form one article.
   A group has at most one published variant per language. Every keyed variant
   has an explicit supported `lang`; invalid keys, missing language on a keyed
   variant, and duplicate group/language pairs fail export or snapshot loading
   rather than silently dropping or overwriting a version.
3. A post without `translationKey` remains a standalone article identified by
   its full slug. Standalone identity and explicit translation identity occupy
   separate namespaces: a matching string alone does not join them. There is
   no suffix stripping, filename inference, title matching, or language guessing.
4. To pair an existing article later, edit metadata in its owning source and
   give both variants the same explicit key. Preserve existing slugs, prose,
   dates, and assets. The other three current articles need no metadata
   migration to remain visible.
5. Titles, descriptions, bodies, dates, slugs, and publication flags remain
   version-specific. Tags are topic identifiers, not translated UI strings.
   Authors reuse the same tag spelling for the same topic. The logical article
   exposes the distinct union of tags on its currently published variants.
   No new tag taxonomy, automatic spelling merge, or cross-version tag-equality
   requirement is introduced.
6. Group only records already admitted by the existing publication rules.
   Unpublished versions cannot contribute titles, tags, dates, languages, links,
   or other public metadata. Legacy local publication defaults remain unchanged;
   a legacy post without `lang` is standalone, appears in `All`, and does not
   match either explicit language filter or claim a language badge.

Illustrative source metadata for a future pair (not a publication instruction):

```yaml
# Chinese source file
slug: example-zh
translationKey: example
lang: zh
```

```yaml
# English source file
slug: example-en
translationKey: example
lang: en
```

Both files independently satisfy the existing publication requirements. The
website schema and exporter must support the new field before a source sync can
retain it. Generated copies in this repository are never hand-edited.

## List behavior

### Cards, display language, and ordering

- The unfiltered Blog list contains exactly one card per logical article.
- The initial filter state is language `All` and tag `All tags`.
- In `All`, a card uses its published Chinese version when available; otherwise
  it uses its published English version. An unlabelled legacy standalone uses
  its existing content. There is no browser-language detection or saved global
  locale preference.
- In a specific language filter, every card uses that language's title,
  description, and main article link. Articles without that published language
  are absent; no fallback masks the selected filter.
- A card identifies its available published languages. Each language link opens
  that version directly, including when another language is selected in the
  filter. The title/main link opens the card's displayed version. A single-language
  article remains a normal card with its available language identified.
- Cards display the logical article date: the earliest date among currently
  published variants. Sort by that date descending, then stable group identity
  ascending for ties. Filters do not change this relative order. Detail pages
  continue displaying the selected version's own date.
- Adding a later-dated translation does not bump the article to the top. Adding
  an earlier-dated version or withdrawing the earliest version can change the
  derived date and order. A permanent historical publication registry is outside
  scope; withdrawal removes that version's metadata from the public grouping.

### Filters and navigation state

- Language is single-select: `All`, `English`, or `繁體中文`.
- Tag is single-select: `All tags` or one tag from the published article groups.
  The available tag set is derived from the complete published list, so changing
  language does not erase the chosen tag or remove tag options.
- Conditions combine with AND: the article has the selected published language
  (unless `All`) and contains the selected tag (unless `All tags`). Tag matching
  uses the shared published tag union defined above.
- Controls show the active choices and the number of matching logical articles.
  An empty intersection shows `No articles match these filters.` and a
  `Clear filters` action. Clearing restores `All` / `All tags` and the full list.
- The URL holds filter state through `lang=en|zh` and an encoded `tag` value;
  absent parameters mean the respective `All` choice. For example,
  `/blog/?lang=en&tag=Harness` opens the corresponding filtered list.
- Changing a filter creates a browser-history entry. Refreshing, opening a
  copied URL, and browser Back/Forward restore the selected controls and results.
  Returning from an article through browser history restores the prior list.
  Unsupported language values and tags no longer present in the published list
  independently fall back to their `All` choice without failing the page.
- Filtering runs in the browser over published article summaries. The static
  export must not require request-time query processing, middleware, cookies,
  a new API, or private-source access. Without JavaScript, the exported page
  still presents the unfiltered list and working version links; interactive
  filtering requires JavaScript.

## Article pages and presentation

- Existing `/blog/<slug>/` routes remain the reading URLs. Every published
  variant is statically generated even though the list is grouped.
- A multi-language article shows its language switch near the title. The current
  language is identified; other available languages are ordinary links to the
  corresponding published version of the same group. Switching changes the
  title, description metadata, and body together through navigation to that URL.
- A single-language article has no unavailable-language action. Direct links to
  absent or withdrawn versions remain unavailable under existing static-site
  behavior; there is no automatic redirect or substitute translation.
- A variant's metadata uses its own title and description and its own canonical
  URL. For labelled variants, alternate-language metadata lists only the group's
  published variants, including itself, with reciprocal fully qualified URLs.
  Use `zh-Hant` for the current Traditional Chinese content and `en` for English.
  Mark labelled article/card content with the corresponding HTML language
  attribute; site navigation and other English UI keep their language.
  Unlabelled legacy articles retain their existing language inheritance, have
  their own canonical URL, and emit no language alternates or inferred content
  language attribute. Their language can be explicitly supplied by the author
  in a later content change.
- Keep the existing visual style, light/dark themes, and responsive layout.
  Filter controls and language links are labelled, keyboard-operable, have
  visible focus, and expose selection without relying on color alone. The
  existing stretched card link must not cover language links or create nested
  anchors. No whole-page redesign is required.
- Cross-version heading/scroll synchronization is outside scope.

## Implementation boundaries

This is a design boundary map, not an implementation task plan or a claim that
the following new APIs already exist.

| Owning area | Required responsibility |
| --- | --- |
| `features/blog/schema.mjs` | Recognize and validate the additive identity field; retain existing legacy and imported publication rules. |
| `scripts/sync-blog.mjs` | Carry approved identity metadata through export and reject invalid published pairings without exporting extra source metadata. |
| `features/blog/services/` and `types.ts` | Preserve flat variant access for static routes; derive grouped summaries and sibling-version lookup from published records. Validate pairing when consuming snapshots as well as exporting. |
| `features/blog/components/` and `app/blog/page.tsx` | Render grouped cards and add browser-side language/tag controls. Send summaries, not article bodies or source paths, to the filtering component. |
| `app/blog/[slug]/page.tsx` | Preserve per-slug rendering and add sibling links, localized metadata, and language attributes. |
| Source-owned article metadata and publishing documentation | Add pairing keys only where a translation is being connected; regenerate snapshots through the existing source workflow. |

Exact helper names and component splits are left to the implementer. Use the
existing build-time reader and static export; this feature does not require a
general i18n framework, CMS, database, or replacement publication mechanism.
All new links, canonical/alternate URLs, and browser URL updates must work at
both the site root and the GitHub Pages `/yusa-CV` base path without missing or
double prefixes. Absolute article metadata uses the current production origin
`https://yusaanthya.github.io`, the build's configured base path (empty for a
root-hosted build, `/yusa-CV` for the current Pages deployment), and the existing
`/blog/<slug>/` route. For example, the deployed Chinese preface canonical URL
is `https://yusaanthya.github.io/yusa-CV/blog/harness-preface-zh/`. Declare this
origin as site metadata at build time; do not infer it from a request or browser
location. This is a proposed metadata addition, not an existing setting.
Route-prefix handling follows the existing Next.js/link and asset conventions
rather than blindly applying one helper to every URL.

## Rollout and publication boundary

1. Ship and verify website support for optional pairing metadata while existing
   snapshots still have no keys. The current four cards and all existing URLs
   continue to work at this stage.
2. In the owning source repository, attach an explicit key to the variants being
   paired and use the existing export process to regenerate the snapshot.
   A single published version in a group remains valid.
3. Publication of any translation is a separate owner-approved content action:
   it requires its own valid metadata and explicit publication flag. This spec
   PR supplies no publication approval and invents no date or translation text.

Changing schemas or grouping does not relax explicit source publication, snapshot
completeness, committed-only reads, supported source locations, asset/link
validation, or the separation of public and private credentials. When an export
or build fails, existing failure behavior applies; the feature must not silently
skip an invalid published variant to make a deployment succeed. Withdrawing a
version removes its available-language entry after a successful sync/deploy;
withdrawing the last published version removes the article. Existing validation
of links to withdrawn articles still applies.

## Acceptance criteria

These are requirements for the later implementation, not test results of this
documentation PR. Bilingual and unpublished cases use synthetic fixtures until
the owner independently approves real translation publication.

1. **Backward compatibility:** The four current published variants produce four
   cards, including all three Chinese-only articles, with their existing reading
   URLs intact and no required metadata edits to those three articles.
2. **One article per pair:** Adding an eligible English fixture paired with one
   of those articles produces five version routes and four logical cards. Each
   card language link and each article switch resolves to the correct version
   of that same article; unrelated articles never merge through similar slugs.
3. **Identity integrity:** Invalid supplied keys, a keyed variant without a
   supported language, and two published variants with the same key/language
   fail export or snapshot loading. Distinct unkeyed slugs remain standalone;
   unlabelled legacy posts remain visible in `All` without a fabricated language.
4. **Display and dates:** `All` chooses Chinese when both versions exist;
   explicit language filters choose that language. Adding a later translation
   leaves card order and article date unchanged. Earlier-version addition and
   earliest-version withdrawal follow the documented date rule.
5. **Filter combinations:** Language and single-tag filters combine with AND,
   match the published shared tag union, count logical articles, and never
   substitute Chinese content for an English result. Tag choices remain stable
   across language selection, including when the intersection is empty.
6. **Empty and restored state:** Empty results expose clear feedback and reset.
   URL loading, refresh, Back/Forward, and return from an article restore filters
   and results. Invalid language or unavailable tag values use the documented
   independent defaults.
7. **Publication isolation:** An unpublished sibling contributes no public card,
   route, language link, alternate metadata, tag option, or date. Withdrawal of
   one or all published siblings updates the group correctly after successful
   synchronization; unrelated source metadata remains excluded.
8. **Version-specific output:** Every generated variant retains its own body,
   title, description, and canonical URL using the declared origin and configured
   base path. Labelled variants have appropriate language annotations and
   reciprocal alternate-language URLs referencing only published versions.
   Unlabelled legacy variants have a canonical URL but no language alternates
   or inferred content language attribute.
9. **Usable controls:** New controls and language links work by keyboard and on
   narrow mobile screens in both themes. Main card links do not intercept
   language controls; a single-language article has no broken translation action.
10. **Static hosting:** Production static export succeeds with a nonempty
    `/yusa-CV` base path. Existing article links/assets and new navigation/filter
    URLs resolve correctly. The no-JavaScript page still exposes all published
    logical articles and working version links.

## Verification and non-goals

Extend the existing [`scripts/sync-blog.test.mjs`](../../scripts/sync-blog.test.mjs)
fixture suite for publication and pairing integrity, and add direct coverage of
grouping/filter behavior at the owning data boundary. Exercise UI navigation
and generated output for the criteria above. The implementation must retain a
passing `npm run test:blog` and `npm run build`; use the existing deployment
base-path configuration when validating the exported site. Test commands here
describe future implementation validation, not checks already run for this PR.

Review focuses on wrong article grouping/content, broken public links, draft
disclosure, and filter behavior. Cosmetic details such as exact control spacing
are implementer choices within the existing style, not additional acceptance
criteria. The language-specific content remains separately maintained; detecting
translation freshness or enforcing simultaneous publication is outside scope.

Also excluded: whole-site localization, rewriting existing article prose,
publishing translations, full-text search, multi-tag selection, series navigation,
pagination, user-selectable sorting, RSS/sitemap work, automatic translation,
and changes to workflow credentials or publication permissions.
