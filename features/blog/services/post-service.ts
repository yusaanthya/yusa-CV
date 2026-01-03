import { getHelpers, getBySlug } from '@/lib/content/reader';
import { BlogPostSchema, type BlogPost } from '../types';

const BLOG_DIR = 'posts';

export const BlogService = {
    async getAllPosts(): Promise<BlogPost[]> {
        return getHelpers(BLOG_DIR, BlogPostSchema);
    },

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        return getBySlug(BLOG_DIR, slug, BlogPostSchema);
    }
};
