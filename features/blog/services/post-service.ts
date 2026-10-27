import { readBlogPosts, readBlogPost } from './post-files.mjs';
import type { BlogPost } from '../types';

export const BlogService = {
    async getAllPosts(): Promise<BlogPost[]> {
        return readBlogPosts();
    },

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        return readBlogPost(slug);
    }
};
