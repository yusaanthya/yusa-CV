// Pure grouping, display selection, tag and URL-state logic for the blog list.
// No file system access, so the browser bundle and `node --test` can both import it.

/**
 * @typedef {import('../types').BlogLang} BlogLang
 * @typedef {import('../types').BlogPost} BlogPost
 * @typedef {import('../types').BlogArticleVersion} BlogArticleVersion
 * @typedef {import('../types').BlogArticleSummary} BlogArticleSummary
 * @typedef {import('../types').BlogDisplayLang} BlogDisplayLang
 * @typedef {import('../types').BlogListState} BlogListState
 * @typedef {import('../types').BlogListEntry} BlogListEntry
 * @typedef {import('../types').BlogTagCount} BlogTagCount
 */

/** @type {BlogLang[]} */
const LANG_ORDER = ['zh', 'en'];

/** Display language of the exported HTML, the no-JavaScript page and the pre-hydration snapshot. */
export const STATIC_DISPLAY_LANG = /** @type {const} */ ('zh');

/** @type {Readonly<Record<BlogLang, string>>} */
export const LANGUAGE_LABELS = { zh: '中文', en: 'EN' };

/** Values for HTML `lang` and `hrefLang` attributes. @type {Readonly<Record<BlogLang, string>>} */
export const CONTENT_LANGUAGE = { zh: 'zh-Hant', en: 'en' };

/**
 * Throws if a keyed post has no `lang`, or if two posts share a key/lang pair.
 * @param {Pick<BlogPost, 'slug' | 'lang' | 'translationKey'>[]} posts
 * @returns {void}
 */
export function assertValidPairing(posts) {
    /** @type {Map<string, string>} */
    const seen = new Map();
    for (const { slug, lang, translationKey: key } of posts) {
        if (key === undefined) continue;
        if (!lang) throw new Error(`Blog post "${slug}" has translationKey "${key}" but no lang`);
        const pair = `${key}\n${lang}`;
        const other = seen.get(pair);
        if (other !== undefined) {
            throw new Error(`Blog posts "${other}" and "${slug}" share translationKey "${key}" and lang "${lang}"`);
        }
        seen.set(pair, slug);
    }
}

/**
 * Groups published posts into logical articles, newest earliest-date first.
 * @param {BlogPost[]} posts
 * @returns {BlogArticleSummary[]}
 */
export function groupBlogPosts(posts) {
    assertValidPairing(posts);
    /** @type {Map<string, BlogPost[]>} */
    const groups = new Map();
    for (const post of posts) {
        const id = post.translationKey === undefined ? `slug:${post.slug}` : `key:${post.translationKey}`;
        groups.set(id, [...(groups.get(id) ?? []), post]);
    }
    /** @param {BlogPost} post */
    const rank = (post) => (post.lang ? LANG_ORDER.indexOf(post.lang) : 0);
    return [...groups].map(([id, members]) => {
        const ordered = [...members].sort((a, b) => rank(a) - rank(b));
        return {
            id,
            date: ordered.map((post) => post.date).reduce((a, b) => (b < a ? b : a)),
            tags: [...new Set(ordered.flatMap((post) => post.tags))],
            versions: ordered.map(({ slug, lang, title, description, date }) => (
                lang ? { slug, lang, title, description, date } : { slug, title, description, date })),
        };
    }).sort((a, b) => b.date.localeCompare(a.date) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * Published versions of the article containing `slug`, or `[]` if none does.
 * @param {BlogArticleSummary[]} articles
 * @param {string} slug
 * @returns {BlogArticleVersion[]}
 */
export function findArticleVersions(articles, slug) {
    return articles.find((article) => article.versions.some((version) => version.slug === slug))?.versions ?? [];
}

/**
 * First entry whose primary subtag is `zh` or `en` decides; otherwise `en`.
 * @param {readonly string[]} languages
 * @returns {BlogDisplayLang}
 */
export function detectPreferredLang(languages) {
    for (const language of languages) {
        const primary = language.split('-')[0].toLowerCase();
        if (primary === 'zh' || primary === 'en') return primary;
    }
    return 'en';
}

/**
 * The version in `lang`, else the other language, else the only (unlabelled) version.
 * @param {BlogArticleSummary} article
 * @param {BlogDisplayLang} lang
 * @returns {BlogArticleVersion}
 */
export function selectVersion(article, lang) {
    const other = lang === 'zh' ? 'en' : 'zh';
    return article.versions.find((version) => version.lang === lang)
        ?? article.versions.find((version) => version.lang === other)
        ?? article.versions[0];
}

/**
 * Articles carrying `tag` (all when `null`), each with its displayed version. Never filters by `lang`.
 * @param {BlogArticleSummary[]} articles
 * @param {BlogDisplayLang} lang
 * @param {string | null} tag
 * @returns {BlogListEntry[]}
 */
export function listArticles(articles, lang, tag) {
    return articles
        .filter((article) => tag === null || article.tags.includes(tag))
        .map((article) => ({ article, version: selectVersion(article, lang) }));
}

/**
 * Logical-article count per distinct tag, alphabetical ignoring case.
 * @param {BlogArticleSummary[]} articles
 * @returns {BlogTagCount[]}
 */
export function countTags(articles) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const article of articles) {
        for (const tag of new Set(article.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts].map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => a.tag.localeCompare(b.tag, 'en', { sensitivity: 'base' }));
}

/**
 * Case-insensitive substring match on tag names; an empty (trimmed) query returns all.
 * @param {BlogTagCount[]} tags
 * @param {string} query
 * @returns {BlogTagCount[]}
 */
export function matchTags(tags, query) {
    const needle = query.trim().toLowerCase();
    return tags.filter(({ tag }) => tag.toLowerCase().includes(needle));
}

/**
 * Reads list state from the URL; invalid `lang` and unknown `tag` fall back to `null` independently.
 * @param {URLSearchParams} params
 * @param {string[]} availableTags
 * @returns {BlogListState}
 */
export function parseBlogListState(params, availableTags) {
    const lang = params.get('lang');
    const tag = params.get('tag');
    return {
        lang: lang === 'zh' || lang === 'en' ? lang : null,
        tag: tag !== null && availableTags.includes(tag) ? tag : null,
    };
}

/**
 * `?lang=…&tag=…` without `null` keys, or `""` when both are `null`.
 * @param {BlogListState} state
 * @returns {string}
 */
export function blogListQuery(state) {
    const params = new URLSearchParams();
    if (state.lang !== null) params.set('lang', state.lang);
    if (state.tag !== null) params.set('tag', state.tag);
    const query = params.toString();
    return query ? `?${query}` : '';
}
