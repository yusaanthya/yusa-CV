import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { BlogPostSchema, ImportedPostSchema } from '../schema.mjs';
import { assertValidPairing } from './post-groups.mjs';

/** @param {string} root */
export function readBlogPosts(root = process.cwd()) {
    const localDir = path.join(root, 'content/posts');
    const importedDir = path.join(root, 'content/synced-posts');
    const manifestPath = path.join(importedDir, 'manifest.json');
    const posts = [];
    const slugs = new Set();
    /** @param {string} directory @param {string[]} files @param {boolean} imported */
    const read = (directory, files, imported) => {
        for (const file of files) {
            const slug = file.slice(0, -3);
            if (slugs.has(slug)) throw new Error(`Duplicate blog slug: ${slug}`);
            slugs.add(slug);
            const { data, content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
            // Drafts are excluded before validating publication-only metadata.
            if (!imported && data.published === false) continue;
            const schema = imported ? ImportedPostSchema : BlogPostSchema;
            const metadata = schema.parse({ ...data, slug });
            posts.push({ ...metadata, content });
        }
    };
    const localFiles = fs.existsSync(localDir)
        ? fs.readdirSync(localDir).filter((file) => file.endsWith('.md')) : [];
    read(localDir, localFiles, false);
    if (!fs.existsSync(manifestPath)) {
        throw new Error('Published blog snapshot is incomplete or missing its manifest.');
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest || Object.keys(manifest).length !== 1 || !Array.isArray(manifest.slugs)
        || manifest.slugs.some((slug) => !BlogPostSchema.shape.slug.safeParse(slug).success)) {
        throw new Error('Invalid published blog snapshot manifest');
    }
    const expectedFiles = manifest.slugs.map((slug) => `${slug}.md`).sort();
    const actualFiles = fs.readdirSync(importedDir).filter((file) => file.endsWith('.md')).sort();
    if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
        throw new Error('Published blog files do not match the snapshot manifest');
    }
    read(importedDir, expectedFiles, true);
    // Local and imported posts are grouped together, so pairing is validated across both.
    assertValidPairing(posts);
    return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** @param {string} slug @param {string} root */
export function readBlogPost(slug, root = process.cwd()) {
    return readBlogPosts(root).find((post) => post.slug === slug) ?? null;
}
