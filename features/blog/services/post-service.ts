import { readBlogPosts, readBlogPost } from './post-files.mjs';
import { groupBlogPosts, findArticleVersions } from './post-groups.mjs';
import type { BlogPost, BlogArticleSummary, BlogArticleVersion } from '../types';

export const BlogService = {
    async getAllPosts(): Promise<BlogPost[]> {
        return readBlogPosts();
    },

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        return readBlogPost(slug);
    },

    /** One summary per logical article, ordered by earliest published date descending. */
    async getArticleSummaries(): Promise<BlogArticleSummary[]> {
        return groupBlogPosts(readBlogPosts());
    },

    /** Published versions of the article containing `slug` (itself included), or `[]`. */
    async getArticleVersions(slug: string): Promise<BlogArticleVersion[]> {
        return findArticleVersions(groupBlogPosts(readBlogPosts()), slug);
    }
};
