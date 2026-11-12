import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { BlogPostSchema } from '../schema.mjs';
import { assertValidPairing } from './post-groups.mjs';

/** @param {string} root */
export function readBlogPosts(root = process.cwd()) {
    const directory = path.join(root, 'content/synced-posts');
    const manifestPath = path.join(directory, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        throw new Error('Published blog snapshot is incomplete or missing its manifest.');
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest || Object.keys(manifest).length !== 1 || !Array.isArray(manifest.slugs)
        || manifest.slugs.some((slug) => !BlogPostSchema.shape.slug.safeParse(slug).success)) {
        throw new Error('Invalid published blog snapshot manifest');
    }
    const expectedFiles = manifest.slugs.map((slug) => `${slug}.md`).sort();
    const actualFiles = fs.readdirSync(directory).filter((file) => file.endsWith('.md')).sort();
    if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
        throw new Error('Published blog files do not match the snapshot manifest');
    }
    const posts = expectedFiles.map((file) => {
        const { data, content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
        return { ...BlogPostSchema.parse({ ...data, slug: file.slice(0, -3) }), content };
    });
    assertValidPairing(posts);
    return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** @param {string} slug @param {string} root */
export function readBlogPost(slug, root = process.cwd()) {
    return readBlogPosts(root).find((post) => post.slug === slug) ?? null;
}
