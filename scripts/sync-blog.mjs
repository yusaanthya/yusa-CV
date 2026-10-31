import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { BlogPostSchema, ImportedPostSchema } from '../features/blog/schema.mjs';
import { assertValidPairing } from '../features/blog/services/post-groups.mjs';

const articlePath = /^[^./][^/]*\/(zh|en)\/.+\.md$/;
const imageExtension = /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i;
const externalUrl = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const parser = unified().use(remarkParse).use(remarkGfm);

function visit(node, fn) {
    fn(node);
    node.children?.forEach((child) => visit(child, fn));
}

// Locate only the destination in a parser-confirmed link, image, or definition.
// Applying offset edits preserves the author's Markdown, including code fences.
function destinationRange(node, body) {
    const start = node.position.start.offset;
    const segment = body.slice(start, node.position.end.offset);
    let offset;
    if (node.type === 'definition') {
        offset = segment.match(/^\s{0,3}\[(?:\\.|[^\]])+\]:\s*/)?.[0].length;
    } else if (node.type === 'image') {
        // MDAST images flatten their alt text. Parse the corresponding link to
        // recover inline-code spans, whose brackets must not close the label.
        const codeSpans = new Map();
        visit(parser.parse(segment.slice(1)), (child) => {
            if (child.type === 'inlineCode') {
                codeSpans.set(child.position.start.offset + 1, child.position.end.offset);
            }
        });
        let depth = 1;
        for (let i = 2; i < segment.length; i++) {
            if (codeSpans.has(i)) { i = codeSpans.get(i); continue; }
            if (segment[i] === '\\') { i++; continue; }
            if (segment[i] === '[') depth++;
            if (segment[i] === ']' && --depth === 0) {
                if (segment[i + 1] === '(') offset = i + 2;
                break;
            }
        }
    } else {
        const labelEnd = node.children?.at(-1)?.position.end.offset - start;
        const marker = segment.indexOf('](', Number.isFinite(labelEnd) ? labelEnd : 0);
        if (marker >= 0) offset = marker + 2;
    }
    if (offset === undefined) throw new Error('Unsupported Markdown link destination');
    while (/\s/.test(segment[offset] ?? '') && offset < segment.length) offset++;
    if (segment[offset] === '<') {
        const end = segment.indexOf('>', offset + 1);
        if (end < 0) throw new Error('Invalid bracketed Markdown destination');
        return [start + offset + 1, start + end];
    }
    const begin = offset;
    let depth = 0;
    for (; offset < segment.length; offset++) {
        const char = segment[offset];
        if (char === '\\') { offset++; continue; }
        if (/\s/.test(char)) break;
        if (char === '(') depth++;
        if (char === ')') { if (depth === 0) break; depth--; }
    }
    return [start + begin, start + offset];
}

/** Export committed source content. The private publishing workflow selects main. */
export function syncBlog({ source, root = process.cwd() }) {
    const output = path.join(root, 'content/synced-posts');
    const assetsOutput = path.join(root, 'public/images/synced-blog');
    const marker = path.join(output, 'manifest.json');
    // Invalidate stale success even if source access or validation fails below.
    fs.rmSync(marker, { force: true });
    if (!source) throw new Error('Pass --source pointing to a checked-out blog-post repository');
    const sourceRoot = fs.realpathSync(source);
    const git = (...args) => execFileSync('git', ['-C', sourceRoot, ...args], { maxBuffer: 32 * 1024 * 1024 });
    if (fs.realpathSync(git('rev-parse', '--show-toplevel').toString().trim()) !== sourceRoot) {
        throw new Error('Source must be the root of the blog-post checkout');
    }
    const commit = git('rev-parse', '--verify', 'HEAD^{commit}').toString().trim();
    const entries = new Map(git('ls-tree', '-r', '-z', commit).toString().split('\0').filter(Boolean).map((entry) => {
        const separator = entry.indexOf('\t');
        const metadata = entry.slice(0, separator);
        const filename = entry.slice(separator + 1);
        const [mode, type, oid] = metadata.split(' ');
        return [filename, { mode, type, oid }];
    }));
    const blob = (filename) => {
        const entry = entries.get(filename);
        if (!entry || entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) {
            throw new Error(`Missing or non-regular source file: ${filename}`);
        }
        return git('cat-file', 'blob', entry.oid);
    };
    const posts = new Map();
    const slugs = new Set();
    const publishedSlugs = new Set();
    // The reader groups local and imported posts together, so pairing is validated on both.
    const localMetadata = [];
    const local = path.join(root, 'content/posts');
    if (fs.existsSync(local)) {
        for (const file of fs.readdirSync(local).filter((file) => file.endsWith('.md'))) {
            const slug = file.slice(0, -3);
            slugs.add(slug);
            const { data } = matter(fs.readFileSync(path.join(local, file), 'utf8'));
            if (data.published !== false) {
                localMetadata.push(BlogPostSchema.parse({ ...data, slug }));
                publishedSlugs.add(slug);
            }
        }
    }
    for (const filename of entries.keys()) {
        const match = filename.match(articlePath);
        if (!match) continue;
        const { data, content } = matter(blob(filename).toString('utf8'));
        if (data.published !== undefined && typeof data.published !== 'boolean') {
            throw new Error(`published must be a Boolean: ${filename}`);
        }
        if (data.published !== true) continue;
        const metadata = ImportedPostSchema.parse(data);
        if (metadata.lang !== match[1]) throw new Error(`Language does not match directory: ${filename}`);
        if (slugs.has(metadata.slug)) throw new Error(`Duplicate blog slug: ${metadata.slug}`);
        slugs.add(metadata.slug);
        publishedSlugs.add(metadata.slug);
        if (!content.trim()) throw new Error(`Published article is empty: ${filename}`);
        posts.set(filename, { metadata, content });
    }
    assertValidPairing([...localMetadata, ...[...posts.values()].map(({ metadata }) => metadata)]);
    const images = new Map();
    const rendered = new Map();
    for (const [filename, { metadata, content }] of posts) {
        const tree = parser.parse(content);
        const edits = [];
        const imageReferences = new Set();
        const linkReferences = new Set();
        visit(tree, (node) => {
            if (node.type === 'imageReference') imageReferences.add(node.identifier);
            if (node.type === 'linkReference') linkReferences.add(node.identifier);
        });
        const rewrite = (url, image) => {
            if (externalUrl.test(url)) return url;
            const match = url.match(/^([^?#]*)(.*)$/);
            let target;
            try {
                target = decodeURIComponent(match[1]);
            } catch (error) {
                if (!(error instanceof URIError)) throw error;
                throw new Error(`Invalid URL encoding in ${filename}: ${url}`, { cause: error });
            }
            const suffix = match[2];
            if (target.startsWith('/blog/') && !image) {
                if (target === '/blog/') return url;
                const slug = target.match(/^\/blog\/([^/]+)\/?$/)?.[1];
                if (!slug || !publishedSlugs.has(slug)) {
                    throw new Error(`Article link targets missing or unpublished content: ${filename} -> ${target}`);
                }
                return `/blog/${slug}/${suffix}`;
            }
            const resolved = path.posix.normalize(target.startsWith('/') ? target.slice(1) : path.posix.join(path.posix.dirname(filename), target));
            if (resolved === '..' || resolved.startsWith('../') || resolved.includes('\\')) {
                throw new Error(`Link escapes source repository in ${filename}`);
            }
            if (image) {
                if (!imageExtension.test(resolved)) throw new Error(`Unsupported local image: ${resolved}`);
                const bytes = blob(resolved);
                const digest = createHash('sha256').update(bytes).digest('hex');
                const assetName = `${metadata.slug}/${digest}${path.posix.extname(resolved).toLowerCase()}`;
                images.set(assetName, bytes);
                return `/images/synced-blog/${assetName}${suffix}`;
            }
            const post = posts.get(resolved);
            if (!post) throw new Error(`Article link targets missing or unpublished content: ${filename} -> ${resolved}`);
            return `/blog/${post.metadata.slug}/${suffix}`;
        };
        const first = tree.children[0];
        if (first?.type === 'heading' && first.depth === 1) {
            let heading = '';
            visit(first, (node) => { if (node.type === 'text' || node.type === 'inlineCode') heading += node.value; });
            if (heading.trim() === metadata.title.trim()) edits.push([first.position.start.offset, first.position.end.offset, '']);
        }
        visit(tree, (node) => {
            if (!['link', 'image', 'definition'].includes(node.type)) return;
            if (edits.some(([start, end]) => node.position.start.offset >= start && node.position.end.offset <= end)) return;
            if (node.type === 'definition' && !imageReferences.has(node.identifier) && !linkReferences.has(node.identifier)) return;
            const image = node.type === 'image' || (node.type === 'definition' && imageReferences.has(node.identifier));
            if (node.type === 'definition' && image && linkReferences.has(node.identifier) && !externalUrl.test(node.url)) {
                throw new Error(`Local reference used as both image and article link: ${node.identifier}`);
            }
            const next = rewrite(node.url, image);
            if (next !== node.url) edits.push([...destinationRange(node, content), next]);
        });
        let body = content;
        for (const [start, end, value] of edits.sort((a, b) => b[0] - a[0])) body = body.slice(0, start) + value + body.slice(end);
        if (!body.trim()) throw new Error(`Published article has no body after its title: ${filename}`);
        if (metadata.coverImage) metadata.coverImage = rewrite(metadata.coverImage, true);
        rendered.set(metadata.slug, matter.stringify(body, metadata));
    }
    // These are exclusively generated directories; rebuild them so deleted/unpublished
    // articles and their assets cannot survive a successful sync.
    fs.rmSync(output, { recursive: true, force: true });
    fs.rmSync(assetsOutput, { recursive: true, force: true });
    fs.mkdirSync(output, { recursive: true });
    for (const [slug, document] of rendered) fs.writeFileSync(path.join(output, `${slug}.md`), document);
    for (const [name, bytes] of images) {
        const destination = path.join(assetsOutput, name);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, bytes);
    }
    const manifest = { slugs: [...rendered.keys()].sort() };
    fs.writeFileSync(marker, `${JSON.stringify(manifest, null, 2)}\n`);
    return { ...manifest, commit };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    try {
        if (process.argv.length !== 4 || process.argv[2] !== '--source') throw new Error('Usage: npm run sync:blog -- --source <checkout>');
        const result = syncBlog({ source: process.argv[3] });
        console.log(`Synced ${result.slugs.length} published posts from commit ${result.commit}.`);
    } catch (error) {
        console.error(`Blog sync failed: ${error.message}`);
        process.exitCode = 1;
    }
}
