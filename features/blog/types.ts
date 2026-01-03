import { z } from 'zod';

export const BlogPostSchema = z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    date: z.string(), // ISO String YYYY-MM-DD
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    published: z.boolean().default(true),
});

export type BlogPost = z.infer<typeof BlogPostSchema> & {
    content: string; // The markdown body
    readingTime?: string;
};
