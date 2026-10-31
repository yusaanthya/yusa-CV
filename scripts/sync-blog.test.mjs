import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { syncBlog } from './sync-blog.mjs';
import { readBlogPosts, readBlogPost } from '../features/blog/services/post-files.mjs';
import { groupBlogPosts } from '../features/blog/services/post-groups.mjs';

function fixture(t) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-sync-test-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const source = path.join(directory, 'source');
    const root = path.join(directory, 'site');
    fs.mkdirSync(source);
    fs.mkdirSync(path.join(root, 'content/posts'), { recursive: true });
    const git = (...args) => execFileSync('git', ['-C', source, ...args], { stdio: 'pipe' });
    git('init', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    const write = (filename, content) => {
        const destination = path.join(source, filename);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, content);
    };
    const commit = () => { git('add', '.'); git('commit', '-m', 'fixture', '--allow-empty'); };
    const sync = () => syncBlog({ source, root });
    return { source, root, git, write, commit, sync };
}

function article(slug = 'example-zh', extra = {}, body = '# Example\n\nOriginal article text.\n') {
    const metadata = {
        slug, title: 'Example', description: 'A useful example.',
        date: '2026-10-27', lang: 'zh', published: true, ...extra,
    };
    return matter.stringify(body, Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined)));
}

test('only committed, explicitly published article paths are included; legacy posts coexist', (t) => {
    const f = fixture(t);
    f.write('harness/zh/00-example.md', article());
    f.write('harness/zh/draft.md', '---\npublished: false\n---\n# Private draft');
    f.write('harness/zh/unmarked.md', '# Unmarked draft');
    f.write('harness/series-plan.md', article('planning-zh'));
    f.write('README.md', article('readme-zh'));
    f.commit();
    f.write('harness/zh/00-example.md', article('uncommitted-zh'));
    fs.writeFileSync(path.join(f.root, 'content/posts/legacy.md'), article('ignored-local-slug'));
    fs.writeFileSync(path.join(f.root, 'content/posts/local-draft.md'), '---\npublished: false\n---\nPrivate');
    const manifest = f.sync();
    assert.deepEqual(manifest.slugs, ['example-zh']);
    assert.match(manifest.commit, /^[a-f0-9]{40}$/);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.root, 'content/synced-posts/manifest.json'), 'utf8')), {
        slugs: ['example-zh'],
    });
    assert.deepEqual(readBlogPosts(f.root).map((post) => post.slug), ['example-zh', 'legacy']);
    assert.equal(readBlogPost('local-draft', f.root), null);
    assert.equal(readBlogPost('uncommitted-zh', f.root), null);
    assert.equal(readBlogPost('../../README', f.root), null);
    assert.ok(!readBlogPost('example-zh', f.root).content.includes('# Example'));
    assert.ok(readBlogPost('example-zh', f.root).content.includes('Original article text.'));
});

test('rewrites article and image destinations without changing prose or code', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article('first-zh', { coverImage: '../images/pic.png' }, '# Example\n\n[Next](second.md#section "Title")\n![Diagram](../images/pic.png)\n[Reference][next]\n![Image][pic]\n\n[next]: second.md\n[pic]: ../images/pic.png\n\n[External](https://example.com/a.md)\n\n```md\n[Untouched](second.md)\n```\n'));
    f.write('harness/zh/second.md', article('second-zh'));
    f.write('harness/images/pic.png', Buffer.from([137, 80, 78, 71]));
    f.commit();
    f.sync();
    const post = readBlogPost('first-zh', f.root);
    assert.match(post.content, /\[Next\]\(\/blog\/second-zh\/#section "Title"\)/);
    assert.match(post.content, /\[next\]: \/blog\/second-zh\//);
    const imagePath = `/images/synced-blog/first-zh/${createHash('sha256').update(Buffer.from([137, 80, 78, 71])).digest('hex')}.png`;
    assert.ok(post.content.includes(`[pic]: ${imagePath}`));
    assert.match(post.content, /```md\n\[Untouched\]\(second.md\)\n```/);
    assert.match(post.content, /https:\/\/example.com\/a.md/);
    assert.equal(post.coverImage, imagePath);
    assert.deepEqual(fs.readFileSync(path.join(f.root, 'public', post.coverImage)), Buffer.from([137, 80, 78, 71]));
});

test('unpublishing and deletion remove old pages and copied assets', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article('first-zh', {}, '![Diagram](pic.png)'));
    f.write('harness/zh/pic.png', 'image');
    f.write('harness/zh/second.md', article('second-zh'));
    f.commit();
    f.sync();
    f.write('harness/zh/first.md', '---\npublished: false\n---\nDraft again');
    fs.unlinkSync(path.join(f.source, 'harness/zh/second.md'));
    f.commit();
    f.sync();
    assert.deepEqual(readBlogPosts(f.root), []);
    assert.ok(!fs.existsSync(path.join(f.root, 'content/synced-posts/first-zh.md')));
    assert.ok(!fs.existsSync(path.join(f.root, 'public/images/synced-blog')));
});

test('missing snapshot and failed export cannot silently serve stale content', (t) => {
    const f = fixture(t);
    assert.throws(() => readBlogPosts(f.root), /snapshot is incomplete or missing/);
    f.write('harness/zh/first.md', article());
    f.commit();
    f.sync();
    assert.equal(readBlogPosts(f.root).length, 1);
    assert.throws(() => syncBlog({ source: path.join(f.source, 'missing'), root: f.root }));
    assert.throws(() => readBlogPosts(f.root), /snapshot is incomplete or missing/);
});

for (const [name, extra] of [
    ['invalid date', { date: '2026-02-30' }],
    ['missing title', { title: '' }],
    ['whitespace title', { title: '   ' }],
    ['missing date', { date: undefined }],
    ['string publication flag', { published: 'true' }],
    ['unsafe slug', { slug: '../escape' }],
    ['language mismatch', { lang: 'en' }],
]) {
    test(`rejects published metadata: ${name}`, (t) => {
        const f = fixture(t);
        f.write('harness/zh/first.md', article('first-zh', extra));
        f.commit();
        assert.throws(f.sync);
    });
}

test('rejects duplicate imported or local slugs', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article());
    f.write('harness/zh/second.md', article());
    f.commit();
    assert.throws(f.sync, /Duplicate blog slug/);
    fs.unlinkSync(path.join(f.source, 'harness/zh/second.md'));
    f.commit();
    fs.writeFileSync(path.join(f.root, 'content/posts/example-zh.md'), article());
    assert.throws(f.sync, /Duplicate blog slug/);
});

for (const target of ['draft.md', 'missing.md', '../../../outside.md']) {
    test(`rejects unpublished, missing or escaping article link: ${target}`, (t) => {
        const f = fixture(t);
        f.write('harness/zh/first.md', article('first-zh', {}, `[Other](${target})`));
        f.write('harness/zh/draft.md', '---\npublished: false\n---\nDraft');
        f.commit();
        assert.throws(f.sync);
    });
}

test('rejects missing or symlink images', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article('first-zh', {}, '![Diagram](pic.png)'));
    f.commit();
    assert.throws(f.sync, /Missing or non-regular source file/);
    fs.symlinkSync('/etc/passwd', path.join(f.source, 'harness/zh/pic.png'));
    f.commit();
    assert.throws(f.sync, /Missing or non-regular source file/);
});

test('preserves nested image alt text and does not rewrite a removed linked H1', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article('first-zh', {}, '# [Example](unpublished.md)\n\n![A [nested] label](<pic.png> "Image title")\n'));
    f.write('harness/zh/pic.png', 'image');
    f.commit();
    f.sync();
    const body = readBlogPost('first-zh', f.root).content;
    assert.ok(!body.includes('unpublished.md'));
    assert.match(body, /!\[A \[nested\] label\]\(<\/images\/synced-blog\/first-zh\/[a-f0-9]{64}\.png> "Image title"\)/);
});

test('rejects a published title-only stub', (t) => {
    const f = fixture(t);
    f.write('harness/zh/stub.md', article('stub-zh', {}, '# Example\n'));
    f.commit();
    assert.throws(f.sync, /no body after its title/);
});

test('public snapshot contains no private revision or extra metadata and ignores private-only changes', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article('first-zh', { internalNote: 'PRIVATE-METADATA' }));
    f.write('harness/zh/draft.md', '---\npublished: false\n---\nPRIVATE-DRAFT');
    f.write('harness/planning.md', 'PRIVATE-PLAN');
    f.write('harness/images/unreferenced.png', 'PRIVATE-ASSET');
    f.commit();
    const initial = f.sync();
    const snapshot = () => Object.fromEntries(fs.readdirSync(path.join(f.root, 'content/synced-posts')).sort()
        .map((file) => [file, fs.readFileSync(path.join(f.root, 'content/synced-posts', file), 'utf8')]));
    const before = snapshot();
    assert.ok(!JSON.stringify(before).includes(initial.commit));
    assert.ok(!JSON.stringify(before).includes('PRIVATE-'));
    assert.ok(!fs.existsSync(path.join(f.root, 'public/images/synced-blog')));
    f.write('harness/planning.md', 'PRIVATE-PLAN-UPDATED');
    f.commit();
    assert.notEqual(f.sync().commit, initial.commit);
    assert.deepEqual(snapshot(), before);
});

test('reader rejects a manifest with private provenance or missing snapshot files', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article());
    f.commit();
    const result = f.sync();
    const manifestPath = path.join(f.root, 'content/synced-posts/manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(result));
    assert.throws(() => readBlogPosts(f.root), /Invalid published blog snapshot manifest/);
    f.sync();
    fs.unlinkSync(path.join(f.root, 'content/synced-posts/example-zh.md'));
    assert.throws(() => readBlogPosts(f.root), /do not match/);
});

test('validates absolute published article links and preserves query, fragment and index links', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article('first-zh', {}, [
        '[Article](/blog/second-zh)',
        '[Query and fragment](/blog/second-zh/?view=full#details)',
        '[Local](/blog/legacy#details)',
        '[Index](/blog/)',
        '[Index query](/blog/?lang=zh#posts)',
    ].join('\n\n')));
    f.write('harness/zh/second.md', article('second-zh'));
    fs.writeFileSync(path.join(f.root, 'content/posts/legacy.md'), article('legacy'));
    f.commit();
    f.sync();
    const body = readBlogPost('first-zh', f.root).content;
    assert.ok(body.includes('[Article](/blog/second-zh/)'));
    assert.ok(body.includes('[Query and fragment](/blog/second-zh/?view=full#details)'));
    assert.ok(body.includes('[Local](/blog/legacy/#details)'));
    assert.ok(body.includes('[Index](/blog/)'));
    assert.ok(body.includes('[Index query](/blog/?lang=zh#posts)'));
});

for (const target of ['missing', 'draft', 'local-draft', 'source-unmarked']) {
    test(`rejects absolute links to missing or unpublished articles: ${target}`, (t) => {
        const f = fixture(t);
        f.write('harness/zh/first.md', article('first-zh', {}, `[Other](/blog/${target}/?view=full#details)`));
        f.write('harness/zh/draft.md', article('draft', { published: false }));
        fs.writeFileSync(path.join(f.root, 'content/posts/local-draft.md'), article('local-draft', { published: false }));
        f.write('harness/zh/source-unmarked.md', article('source-unmarked', { published: undefined }));
        f.commit();
        assert.throws(f.sync, /Article link targets missing or unpublished content/);
    });
}

test('withdrawing an absolutely linked article fails export instead of leaving a dead link', (t) => {
    const f = fixture(t);
    f.write('harness/zh/first.md', article('first-zh', {}, '[Other](/blog/second-zh/)'));
    f.write('harness/zh/second.md', article('second-zh'));
    f.commit();
    f.sync();
    f.write('harness/zh/second.md', article('second-zh', { published: false }));
    f.commit();
    assert.throws(f.sync, /Article link targets missing or unpublished content/);
    assert.throws(() => readBlogPosts(f.root), /snapshot is incomplete or missing/);
});

for (const alt of ['a `]` b', 'a `` `]` `` b', 'a ```]``b``` c', 'a [nested `]` label] b']) {
    test(`preserves legal image alt text with code-span brackets: ${alt}`, (t) => {
        const f = fixture(t);
        f.write('harness/zh/first.md', article('first-zh', {}, `![${alt}](pic.png "Diagram")`));
        f.write('harness/zh/pic.png', 'image');
        f.commit();
        f.sync();
        const body = readBlogPost('first-zh', f.root).content;
        const digest = createHash('sha256').update('image').digest('hex');
        assert.ok(body.includes(`![${alt}](/images/synced-blog/first-zh/${digest}.png "Diagram")`));
    });
}

test('content hashes avoid same-name image collisions and disclose no source asset paths', (t) => {
    const f = fixture(t);
    const paths = ['../private-originals/a/diagram.PNG', '../private-originals/b/diagram.PNG'];
    f.write('harness/zh/first.md', article('first-zh', { coverImage: paths[0] },
        `![First](${paths[0]})\n\n![Second][other]\n\n[other]: ${paths[1]}?size=2#preview`));
    f.write('harness/private-originals/a/diagram.PNG', 'first image');
    f.write('harness/private-originals/b/diagram.PNG', 'second image');
    f.commit();
    f.sync();
    const first = createHash('sha256').update('first image').digest('hex');
    const second = createHash('sha256').update('second image').digest('hex');
    const post = readBlogPost('first-zh', f.root);
    assert.equal(post.coverImage, `/images/synced-blog/first-zh/${first}.png`);
    assert.ok(post.content.includes(`[other]: /images/synced-blog/first-zh/${second}.png?size=2#preview`));
    assert.ok(!JSON.stringify(post).includes('private-originals'));
    assert.ok(!JSON.stringify(post).includes('diagram.PNG'));
    const files = fs.readdirSync(path.join(f.root, 'public/images/synced-blog/first-zh')).sort();
    assert.deepEqual(files, [`${first}.png`, `${second}.png`].sort());
    assert.equal(fs.readFileSync(path.join(f.root, 'public/images/synced-blog/first-zh', `${first}.png`), 'utf8'), 'first image');
    assert.equal(fs.readFileSync(path.join(f.root, 'public/images/synced-blog/first-zh', `${second}.png`), 'utf8'), 'second image');
});


test('legacy articles default to published consistently in reader and absolute link validation', (t) => {
    const f = fixture(t);
    fs.writeFileSync(path.join(f.root, 'content/posts/legacy.md'), article('legacy', { published: undefined }));
    f.write('harness/zh/first.md', article('first-zh', {}, '[Legacy](/blog/legacy/#details)'));
    f.commit();
    f.sync();
    assert.equal(readBlogPost('legacy', f.root).published, true);
    assert.ok(readBlogPost('first-zh', f.root).content.includes('[Legacy](/blog/legacy/#details)'));
});

for (const body of ['[Other](other%ZZ.md)', '![Image](pic%E0%A4.png)']) {
    test(`invalid URL encoding identifies source and destination: ${body}`, (t) => {
        const f = fixture(t);
        f.write('harness/zh/first.md', article('first-zh', {}, body));
        f.commit();
        const destination = body.slice(body.indexOf('(') + 1, -1);
        assert.throws(f.sync, (error) => {
            assert.equal(error.message, `Invalid URL encoding in harness/zh/first.md: ${destination}`);
            assert.ok(error.cause instanceof URIError);
            return true;
        });
        assert.throws(() => readBlogPosts(f.root), /snapshot is incomplete or missing/);
    });
}

function snapshotFiles(root) {
    const directory = path.join(root, 'content/synced-posts');
    return Object.fromEntries(fs.readdirSync(directory).sort()
        .map((file) => [file, fs.readFileSync(path.join(directory, file), 'utf8')]));
}

const manifestExists = (root) => fs.existsSync(path.join(root, 'content/synced-posts/manifest.json'));

test('exports a translation pair with its key and reads it back as one article', (t) => {
    const f = fixture(t);
    f.write('harness/zh/a.md', article('example-zh', { translationKey: 'example', tags: ['Harness'], internalNote: 'PRIVATE-METADATA' }));
    f.write('harness/en/a.md', article('example-en', {
        lang: 'en', translationKey: 'example', date: '2026-10-31', tags: ['Harness', 'Claude Code'], internalNote: 'PRIVATE-METADATA',
    }));
    f.write('harness/zh/other.md', article('other-zh', { date: '2026-10-28' }));
    f.commit();
    assert.deepEqual(f.sync().slugs, ['example-en', 'example-zh', 'other-zh']);
    const files = snapshotFiles(f.root);
    assert.ok(!JSON.stringify(files).includes('PRIVATE-'));
    for (const slug of ['example-zh', 'example-en']) {
        const { data } = matter(files[`${slug}.md`]);
        assert.equal(data.translationKey, 'example');
        assert.equal(Object.keys(data).at(-1), 'translationKey');
        assert.ok(!('internalNote' in data));
    }
    assert.ok(!('translationKey' in matter(files['other-zh.md']).data));
    const posts = readBlogPosts(f.root);
    assert.deepEqual(posts.map((post) => post.slug).sort(), ['example-en', 'example-zh', 'other-zh']);
    const articles = groupBlogPosts(posts);
    assert.deepEqual(articles.map((entry) => entry.id), ['slug:other-zh', 'key:example']);
    const pair = articles[1];
    assert.deepEqual(pair.versions.map(({ slug, lang }) => [slug, lang]), [['example-zh', 'zh'], ['example-en', 'en']]);
    assert.equal(pair.date, '2026-10-27');
    assert.deepEqual(pair.tags, ['Harness', 'Claude Code']);
});

test('rejects two published versions with the same key and language, leaving no manifest', (t) => {
    const f = fixture(t);
    f.write('harness/zh/a.md', article('example-zh', { translationKey: 'example' }));
    f.commit();
    f.sync();
    assert.ok(manifestExists(f.root));
    f.write('harness/zh/b.md', article('example-zh-copy', { translationKey: 'example' }));
    f.commit();
    assert.throws(f.sync, (error) => {
        assert.match(error.message, /"example-zh"/);
        assert.match(error.message, /"example-zh-copy"/);
        assert.match(error.message, /translationKey "example"/);
        return true;
    });
    assert.ok(!manifestExists(f.root));
    assert.throws(() => readBlogPosts(f.root), /snapshot is incomplete or missing/);
});

test('rejects a keyed local legacy post without a language', (t) => {
    const f = fixture(t);
    f.write('harness/zh/a.md', article('example-zh'));
    f.commit();
    fs.writeFileSync(path.join(f.root, 'content/posts/legacy.md'), article('legacy', { lang: undefined, translationKey: 'legacy-key' }));
    assert.throws(f.sync, /"legacy" has translationKey "legacy-key" but no lang/);
    assert.ok(!manifestExists(f.root));
});

test('validates pairing across local legacy and exported posts together', (t) => {
    const f = fixture(t);
    f.write('harness/zh/a.md', article('example-zh', { translationKey: 'example' }));
    f.commit();
    fs.writeFileSync(path.join(f.root, 'content/posts/legacy.md'), article('legacy', { translationKey: 'example' }));
    assert.throws(f.sync, /"legacy" and "example-zh" share translationKey "example" and lang "zh"/);
    assert.ok(!manifestExists(f.root));
    // An unpublished local draft is not admitted, so it cannot collide.
    fs.writeFileSync(path.join(f.root, 'content/posts/legacy.md'), article('legacy', { translationKey: 'example', published: false }));
    assert.deepEqual(f.sync().slugs, ['example-zh']);
});

for (const key of ['Bad_Key', '', 'example-', 'a/b']) {
    test(`rejects an invalid translation key: ${JSON.stringify(key)}`, (t) => {
        const f = fixture(t);
        f.write('harness/zh/a.md', article('example-zh', { translationKey: key }));
        f.commit();
        assert.throws(f.sync);
        assert.ok(!manifestExists(f.root));
    });
}

test('an unpublished sibling contributes no route, tag, language or date', (t) => {
    const f = fixture(t);
    f.write('harness/zh/a.md', article('example-zh', { translationKey: 'example', tags: ['Harness'] }));
    f.write('harness/en/a.md', article('example-en', {
        lang: 'en', translationKey: 'example', published: false, date: '2026-01-01',
        title: 'PRIVATE-TITLE', tags: ['Harness', 'PRIVATE-TAG'],
    }));
    f.commit();
    assert.deepEqual(f.sync().slugs, ['example-zh']);
    const files = snapshotFiles(f.root);
    assert.ok(!JSON.stringify(files).includes('example-en'));
    assert.ok(!JSON.stringify(files).includes('PRIVATE-'));
    const [entry, ...rest] = groupBlogPosts(readBlogPosts(f.root));
    assert.equal(rest.length, 0);
    assert.equal(entry.id, 'key:example');
    assert.deepEqual(entry.versions.map((version) => version.slug), ['example-zh']);
    assert.deepEqual(entry.tags, ['Harness']);
    assert.equal(entry.date, '2026-10-27');
});

test('withdrawing one and then both versions of a pair updates the group', (t) => {
    const f = fixture(t);
    f.write('harness/zh/a.md', article('example-zh', { translationKey: 'example' }));
    f.write('harness/en/a.md', article('example-en', { lang: 'en', translationKey: 'example', date: '2026-01-01' }));
    f.write('harness/zh/other.md', article('other-zh'));
    f.commit();
    f.sync();
    assert.equal(groupBlogPosts(readBlogPosts(f.root)).find((entry) => entry.id === 'key:example').versions.length, 2);
    f.write('harness/en/a.md', article('example-en', { lang: 'en', translationKey: 'example', published: false }));
    f.commit();
    f.sync();
    assert.ok(!fs.existsSync(path.join(f.root, 'content/synced-posts/example-en.md')));
    const pair = groupBlogPosts(readBlogPosts(f.root)).find((entry) => entry.id === 'key:example');
    assert.deepEqual(pair.versions.map((version) => version.slug), ['example-zh']);
    assert.equal(pair.date, '2026-10-27');
    f.write('harness/zh/a.md', article('example-zh', { translationKey: 'example', published: false }));
    f.commit();
    f.sync();
    assert.deepEqual(groupBlogPosts(readBlogPosts(f.root)).map((entry) => entry.id), ['slug:other-zh']);
});
