import test from 'node:test';
import assert from 'node:assert/strict';
import { BlogPostSchema } from '../features/blog/schema.mjs';
import {
    assertValidPairing, groupBlogPosts, findArticleVersions, STATIC_DISPLAY_LANG, detectPreferredLang,
    selectVersion, listArticles, countTags, matchTags, parseBlogListState, blogListQuery,
    LANGUAGE_LABELS, CONTENT_LANGUAGE,
} from '../features/blog/services/post-groups.mjs';

/**
 * In-memory published post with the reader's output shape.
 * @param {string} slug
 * @param {Record<string, unknown>} extra
 */
function post(slug, extra = {}) {
    return {
        slug, title: `Title ${slug}`, description: `About ${slug}`, date: '2026-01-15',
        tags: [], published: true, lang: 'zh', content: '', ...extra,
    };
}

// The four currently published snapshot variants (all zh, unkeyed).
const current = () => [
    post('harness-preface-zh', { date: '2026-10-31', tags: ['AI', 'Claude Code', 'Agentic Workflow', 'Harness'] }),
    post('leetcode-3sum', { date: '2026-04-15', tags: ['LeetCode', 'Arrays', 'Two Pointers', 'Hash Set'] }),
    post('leetcode-container-with-max-water', { date: '2025-09-08', tags: ['LeetCode', 'Arrays', 'Two Pointers'] }),
    post('sign-key-disassemble', { date: '2026-04-15', tags: ['Next.js', 'SDET'] }),
];

const slugsOf = (versions) => versions.map((version) => version.slug);
const ids = (articles) => articles.map((article) => article.id);

test('a keyed zh/en pair forms one article; findArticleVersions resolves either slug', () => {
    // en listed first to prove versions are ordered zh, en regardless of input order.
    const posts = [
        post('example-en', { lang: 'en', translationKey: 'example' }),
        post('alpha'), post('beta'), post('gamma'),
        post('example-zh', { translationKey: 'example' }),
    ];
    const articles = groupBlogPosts(posts);
    assert.equal(articles.length, 4);
    const pair = articles.find((article) => article.id === 'key:example');
    assert.deepEqual(slugsOf(pair.versions), ['example-zh', 'example-en']);
    assert.deepEqual(pair.versions.map((version) => version.lang), ['zh', 'en']);
    assert.deepEqual(slugsOf(findArticleVersions(articles, 'example-zh')), ['example-zh', 'example-en']);
    assert.deepEqual(slugsOf(findArticleVersions(articles, 'example-en')), ['example-zh', 'example-en']);
    assert.deepEqual(slugsOf(findArticleVersions(articles, 'alpha')), ['alpha']);
    assert.deepEqual(findArticleVersions(articles, 'unknown'), []);
    // Versions carry no body, source path, or coverImage.
    assert.deepEqual(Object.keys(pair.versions[0]).sort(), ['date', 'description', 'lang', 'slug', 'title']);
});

test('similar slugs and a slug equal to a key never merge', () => {
    const similar = groupBlogPosts([post('harness-preface-zh'), post('harness-preface-en', { lang: 'en' })]);
    assert.deepEqual(ids(similar).sort(), ['slug:harness-preface-en', 'slug:harness-preface-zh']);
    const namespaces = groupBlogPosts([post('example'), post('other-zh', { translationKey: 'example' })]);
    assert.deepEqual(ids(namespaces).sort(), ['key:example', 'slug:example']);
});

test('invalid pairings throw from assertValidPairing and groupBlogPosts; invalid keys fail the schema', () => {
    const missingLang = [post('legacy', { lang: undefined, translationKey: 'example' })];
    const duplicate = [
        post('example-zh', { translationKey: 'example' }),
        post('example-again', { translationKey: 'example' }),
    ];
    for (const fn of [assertValidPairing, groupBlogPosts]) {
        assert.throws(() => fn(missingLang), /"legacy".*"example"/);
        assert.throws(() => fn(duplicate), /"example-zh".*"example-again".*"example"/);
    }
    assert.doesNotThrow(() => assertValidPairing([
        post('example-zh', { translationKey: 'example' }),
        post('example-en', { lang: 'en', translationKey: 'example' }),
        post('unkeyed-a'), post('unkeyed-b'), post('legacy', { lang: undefined }),
    ]));
    const valid = { slug: 'example-zh', title: 'T', description: 'D', date: '2026-01-15', lang: 'zh' };
    for (const translationKey of ['Bad_Key', '']) {
        assert.throws(() => BlogPostSchema.parse({ ...valid, translationKey }));
    }
    assert.equal(BlogPostSchema.parse({ ...valid, translationKey: 'example' }).translationKey, 'example');
    assert.equal('translationKey' in BlogPostSchema.parse(valid), false);
    assert.equal(Object.keys(BlogPostSchema.shape).at(-1), 'translationKey');
});

test('an unlabelled legacy post is standalone and listed under both languages', () => {
    const [article] = groupBlogPosts([post('legacy', { lang: undefined })]);
    assert.equal(article.id, 'slug:legacy');
    assert.equal(article.versions.length, 1);
    assert.equal('lang' in article.versions[0], false);
    assert.equal(selectVersion(article, 'zh').slug, 'legacy');
    assert.equal(selectVersion(article, 'en').slug, 'legacy');
    assert.equal(listArticles([article], 'zh', null).length, 1);
    assert.equal(listArticles([article], 'en', null).length, 1);
});

test('detectPreferredLang uses the first zh or en primary subtag, else en', () => {
    const cases = [
        [['zh-TW', 'en'], 'zh'], [['en-US', 'zh-TW'], 'en'], [['ZH-hant'], 'zh'], [['fr-FR', 'zh-CN'], 'zh'],
        [['fr-FR'], 'en'], [[], 'en'], [['zhx', 'en'], 'en'],
    ];
    for (const [languages, expected] of cases) assert.equal(detectPreferredLang(languages), expected, languages.join());
});

test('selectVersion picks the requested language, then the other, never null', () => {
    const [pair] = groupBlogPosts([
        post('example-zh', { translationKey: 'example' }),
        post('example-en', { lang: 'en', translationKey: 'example' }),
    ]);
    assert.equal(selectVersion(pair, 'zh').slug, 'example-zh');
    assert.equal(selectVersion(pair, 'en').slug, 'example-en');
    const [zhOnly] = groupBlogPosts([post('only-zh')]);
    const [enOnly] = groupBlogPosts([post('only-en', { lang: 'en' })]);
    for (const lang of ['zh', 'en']) {
        assert.equal(selectVersion(zhOnly, lang).slug, 'only-zh');
        assert.equal(selectVersion(enOnly, lang).slug, 'only-en');
    }
});

test('listArticles never drops an article by language and keeps order', () => {
    const articles = groupBlogPosts(current());
    const zh = listArticles(articles, 'zh', null);
    const en = listArticles(articles, 'en', null);
    assert.equal(zh.length, 4);
    assert.deepEqual(en.map((entry) => entry.article.id), zh.map((entry) => entry.article.id));
    assert.ok([...zh, ...en].every((entry) => entry.version.lang === 'zh'));
    assert.equal(STATIC_DISPLAY_LANG, 'zh');

    const paired = groupBlogPosts([
        ...current().map((p) => (p.slug === 'harness-preface-zh' ? { ...p, translationKey: 'harness-preface' } : p)),
        post('harness-preface-en', { lang: 'en', date: '2026-11-01', translationKey: 'harness-preface', tags: ['Harness'] }),
    ]);
    const shown = listArticles(paired, 'en', null);
    assert.equal(shown.length, 4);
    assert.deepEqual(shown.map((entry) => entry.version.slug), [
        'harness-preface-en', 'leetcode-3sum', 'sign-key-disassemble', 'leetcode-container-with-max-water',
    ]);
    assert.deepEqual(shown.map((entry) => entry.article.id), listArticles(paired, 'zh', null).map((entry) => entry.article.id));
});

test('article date is the earliest published version date; ties sort by id', () => {
    const other = post('other', { date: '2026-05-01' });
    const zh = post('pair-zh', { date: '2026-04-15', translationKey: 'pair' });
    const laterEn = post('pair-en', { lang: 'en', date: '2026-10-31', translationKey: 'pair' });
    const withoutEn = groupBlogPosts([zh, other]);
    const withLaterEn = groupBlogPosts([zh, laterEn, other]);
    assert.equal(withLaterEn.find((article) => article.id === 'key:pair').date, '2026-04-15');
    assert.deepEqual(ids(withLaterEn), ids(withoutEn));
    assert.deepEqual(ids(withLaterEn), ['slug:other', 'key:pair']);
    assert.equal(withLaterEn.find((article) => article.id === 'key:pair').versions[1].date, '2026-10-31');

    const earlyEn = { ...laterEn, date: '2026-01-01' };
    const pairFirst = groupBlogPosts([zh, other, post('newest', { date: '2026-03-01' })]);
    assert.deepEqual(ids(pairFirst), ['slug:other', 'key:pair', 'slug:newest']);
    const withEarlyEn = groupBlogPosts([zh, earlyEn, other, post('newest', { date: '2026-03-01' })]);
    assert.equal(withEarlyEn.find((article) => article.id === 'key:pair').date, '2026-01-01');
    assert.deepEqual(ids(withEarlyEn), ['slug:other', 'slug:newest', 'key:pair']);

    // Withdrawing the earliest version recomputes the date from what remains.
    const withdrawn = groupBlogPosts([laterEn, other]);
    assert.equal(withdrawn[0].id, 'key:pair');
    assert.equal(withdrawn[0].date, '2026-10-31');

    const tied = groupBlogPosts([post('zeta', { date: '2026-02-02' }), post('alpha-zh', { date: '2026-02-02', translationKey: 'alpha' }), post('alpha', { date: '2026-02-02' })]);
    assert.deepEqual(ids(tied), ['key:alpha', 'slug:alpha', 'slug:zeta']);
});

test('tag matching uses the union of versions; counts are logical articles and match listings', () => {
    const [pair] = groupBlogPosts([
        post('pair-zh', { translationKey: 'pair', tags: ['Harness', 'AI'] }),
        post('pair-en', { lang: 'en', translationKey: 'pair', tags: ['Harness', 'English Only'] }),
    ]);
    assert.deepEqual(pair.tags, ['Harness', 'AI', 'English Only']);
    const matched = listArticles([pair], 'zh', 'English Only');
    assert.equal(matched.length, 1);
    assert.equal(matched[0].version.slug, 'pair-zh');
    assert.deepEqual(countTags([pair]).find((entry) => entry.tag === 'Harness'), { tag: 'Harness', count: 1 });

    const articles = groupBlogPosts(current());
    const counts = countTags(articles);
    assert.deepEqual(Object.fromEntries(counts.map(({ tag, count }) => [tag, count])), {
        'Agentic Workflow': 1, AI: 1, Arrays: 2, 'Claude Code': 1, Harness: 1, 'Hash Set': 1,
        LeetCode: 2, 'Next.js': 1, SDET: 1, 'Two Pointers': 2,
    });
    assert.deepEqual(counts.map((entry) => entry.tag), [
        'Agentic Workflow', 'AI', 'Arrays', 'Claude Code', 'Harness', 'Hash Set', 'LeetCode', 'Next.js', 'SDET', 'Two Pointers',
    ]);
    for (const all of [articles, [...articles, pair]]) {
        for (const { tag, count } of countTags(all)) {
            for (const lang of ['zh', 'en']) assert.equal(listArticles(all, lang, tag).length, count, `${tag} ${lang}`);
        }
    }
});

test('matchTags trims and matches case-insensitively, preserving order', () => {
    const tags = countTags(groupBlogPosts([...current(), post('algo', { tags: ['演算法'] })]));
    const names = (query) => matchTags(tags, query).map((entry) => entry.tag);
    assert.deepEqual(names('two'), ['Two Pointers']);
    assert.deepEqual(names('  LEET '), ['LeetCode']);
    assert.deepEqual(names('演算'), ['演算法']);
    assert.deepEqual(matchTags(tags, ''), tags);
    assert.deepEqual(names('zzz'), []);
});

test('parseBlogListState falls back independently; blogListQuery round-trips', () => {
    const tags = ['LeetCode', 'Claude Code', '演算法'];
    const parse = (query) => parseBlogListState(new URLSearchParams(query), tags);
    assert.deepEqual(parse(''), { lang: null, tag: null });
    assert.deepEqual(parse('lang=fr'), { lang: null, tag: null });
    assert.deepEqual(parse('tag=Gone'), { lang: null, tag: null });
    assert.deepEqual(parse('lang=en&tag=Gone'), { lang: 'en', tag: null });
    assert.deepEqual(parse('lang=zh&tag=LeetCode'), { lang: 'zh', tag: 'LeetCode' });

    for (const state of [
        { lang: 'en', tag: 'Claude Code' }, { lang: 'zh', tag: '演算法' }, { lang: null, tag: 'Claude Code' }, { lang: 'en', tag: null },
    ]) {
        assert.deepEqual(parse(blogListQuery(state)), state);
    }
    assert.equal(blogListQuery({ lang: null, tag: 'LeetCode' }), '?tag=LeetCode');
    assert.equal(blogListQuery({ lang: 'en', tag: 'LeetCode' }), '?lang=en&tag=LeetCode');
    assert.equal(blogListQuery({ lang: null, tag: null }), '');
});

test('language label constants', () => {
    assert.deepEqual(LANGUAGE_LABELS, { zh: '中文', en: 'EN' });
    assert.deepEqual(CONTENT_LANGUAGE, { zh: 'zh-Hant', en: 'en' });
});
