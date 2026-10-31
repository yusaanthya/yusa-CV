import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import { readBlogPosts, readBlogPost } from '../features/blog/services/post-files.mjs';
import { groupBlogPosts, findArticleVersions } from '../features/blog/services/post-groups.mjs';

/**
 * Hand-built site root under os.tmpdir(): a published snapshot (manifest plus
 * Markdown files) and optional local legacy posts. Never touches the repository.
 */
function site(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-reader-test-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const synced = path.join(root, 'content/synced-posts');
    const local = path.join(root, 'content/posts');
    fs.mkdirSync(synced, { recursive: true });
    /** @param {Record<string, unknown>[]} posts metadata objects; each `slug` names its file */
    const snapshot = (posts) => {
        for (const metadata of posts) {
            fs.writeFileSync(path.join(synced, `${metadata.slug}.md`), document(metadata));
        }
        fs.writeFileSync(path.join(synced, 'manifest.json'),
            `${JSON.stringify({ slugs: posts.map((metadata) => metadata.slug).sort() }, null, 2)}\n`);
    };
    /** @param {Record<string, unknown>} metadata */
    const legacy = (metadata) => {
        fs.mkdirSync(local, { recursive: true });
        fs.writeFileSync(path.join(local, `${metadata.slug}.md`), document(metadata));
    };
    return { root, snapshot, legacy };
}

/** @param {Record<string, unknown>} metadata */
function document(metadata) {
    const defined = Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined));
    return matter.stringify(`Body of ${metadata.slug}.\n`, defined);
}

/** Exported snapshot metadata in the exporter's key order. */
function variant(slug, extra = {}) {
    return {
        slug, title: `Title ${slug}`, description: `About ${slug}`, date: '2026-01-15',
        tags: [], published: true, lang: 'zh', ...extra,
    };
}

// Mirrors the four currently published snapshot variants: all zh, none keyed.
const current = () => [
    variant('harness-preface-zh', { date: '2026-10-31', tags: ['AI', 'Claude Code', 'Agentic Workflow', 'Harness'] }),
    variant('leetcode-3sum', { date: '2026-04-15', tags: ['LeetCode', 'Arrays', 'Two Pointers', 'Hash Set'] }),
    variant('leetcode-container-with-max-water', { date: '2025-09-08', tags: ['LeetCode', 'Arrays', 'Two Pointers'] }),
    variant('sign-key-disassemble', { date: '2026-04-15', tags: ['Next.js', 'SDET'] }),
];

test('four unkeyed zh snapshot files load unchanged and group into four articles', (t) => {
    const s = site(t);
    s.snapshot(current());
    const posts = readBlogPosts(s.root);
    assert.deepEqual(posts.map((post) => post.slug), [
        'harness-preface-zh', 'leetcode-3sum', 'sign-key-disassemble', 'leetcode-container-with-max-water',
    ]);
    assert.ok(posts.every((post) => post.lang === 'zh' && post.translationKey === undefined));
    assert.equal(readBlogPost('leetcode-3sum', s.root).content.trim(), 'Body of leetcode-3sum.');
    const articles = groupBlogPosts(posts);
    assert.deepEqual(articles.map((article) => article.id), [
        'slug:harness-preface-zh', 'slug:leetcode-3sum', 'slug:sign-key-disassemble',
        'slug:leetcode-container-with-max-water',
    ]);
    assert.ok(articles.every((article) => article.versions.length === 1));
    assert.deepEqual(findArticleVersions(articles, 'sign-key-disassemble').map((version) => version.slug),
        ['sign-key-disassemble']);
});

test('a keyed zh/en pair in the snapshot loads as two variants and groups into one article', (t) => {
    const s = site(t);
    s.snapshot([
        ...current(),
        variant('harness-preface-en', { lang: 'en', date: '2026-11-02', tags: ['Harness', 'Agents'], translationKey: 'harness-preface' }),
    ].map((metadata) => (metadata.slug === 'harness-preface-zh' ? { ...metadata, translationKey: 'harness-preface' } : metadata)));
    const posts = readBlogPosts(s.root);
    assert.equal(posts.length, 5);
    assert.equal(readBlogPost('harness-preface-en', s.root).translationKey, 'harness-preface');
    const articles = groupBlogPosts(posts);
    assert.equal(articles.length, 4);
    const pair = articles.find((article) => article.id === 'key:harness-preface');
    assert.deepEqual(pair.versions.map((version) => [version.slug, version.lang]),
        [['harness-preface-zh', 'zh'], ['harness-preface-en', 'en']]);
    assert.equal(pair.date, '2026-10-31');
    assert.deepEqual(pair.tags, ['AI', 'Claude Code', 'Agentic Workflow', 'Harness', 'Agents']);
    assert.deepEqual(findArticleVersions(articles, 'harness-preface-en'), pair.versions);
});

test('a snapshot with two files sharing key and lang makes readBlogPosts throw', (t) => {
    const s = site(t);
    s.snapshot([
        variant('example-zh', { translationKey: 'example' }),
        variant('example-again-zh', { translationKey: 'example' }),
    ]);
    assert.throws(() => readBlogPosts(s.root), (error) => {
        assert.match(error.message, /"example-again-zh"/);
        assert.match(error.message, /"example-zh"/);
        assert.match(error.message, /translationKey "example"/);
        return true;
    });
    assert.throws(() => readBlogPost('example-zh', s.root), /share translationKey "example"/);
});

test('pairing is validated across local legacy and imported posts together', (t) => {
    const s = site(t);
    s.snapshot([variant('example-zh', { translationKey: 'example' })]);
    s.legacy(variant('legacy-example', { translationKey: 'example' }));
    assert.throws(() => readBlogPosts(s.root), /share translationKey "example" and lang "zh"/);
});

test('a keyed local legacy post without lang makes readBlogPosts throw', (t) => {
    const s = site(t);
    s.snapshot(current());
    s.legacy(variant('legacy-example', { lang: undefined, translationKey: 'example' }));
    assert.throws(() => readBlogPosts(s.root), /"legacy-example" has translationKey "example" but no lang/);
});

for (const key of ['Bad_Key', '']) {
    test(`an invalid translationKey in the snapshot fails loading: ${JSON.stringify(key)}`, (t) => {
        const s = site(t);
        s.snapshot([variant('example-zh', { translationKey: key })]);
        assert.throws(() => readBlogPosts(s.root), /translationKey/);
    });
}

test('an unlabelled unkeyed legacy post loads and stays a standalone article', (t) => {
    const s = site(t);
    s.snapshot(current());
    s.legacy(variant('legacy-note', { lang: undefined, date: '2024-01-01' }));
    const articles = groupBlogPosts(readBlogPosts(s.root));
    assert.equal(articles.length, 5);
    const legacy = articles.find((article) => article.id === 'slug:legacy-note');
    assert.deepEqual(legacy.versions, [
        { slug: 'legacy-note', title: 'Title legacy-note', description: 'About legacy-note', date: '2024-01-01' },
    ]);
});

test('an unpublished local sibling contributes nothing and cannot cause a pairing conflict', (t) => {
    const s = site(t);
    s.snapshot([variant('example-zh', { translationKey: 'example', tags: ['Public'] })]);
    s.legacy(variant('example-draft', {
        translationKey: 'example', published: false, date: '2020-01-01', tags: ['PRIVATE-TAG'],
    }));
    const articles = groupBlogPosts(readBlogPosts(s.root));
    assert.equal(articles.length, 1);
    assert.deepEqual(articles[0], {
        id: 'key:example', date: '2026-01-15', tags: ['Public'],
        versions: [{ slug: 'example-zh', lang: 'zh', title: 'Title example-zh', description: 'About example-zh', date: '2026-01-15' }],
    });
    assert.ok(!JSON.stringify(articles).includes('PRIVATE-TAG'));
    assert.equal(readBlogPost('example-draft', s.root), null);
});
