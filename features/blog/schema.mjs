import { z } from 'zod';

export const BlogPostSchema = z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, 'Expected a valid calendar date'),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    published: z.boolean().default(true),
    lang: z.enum(['zh', 'en']).optional(),
});

export const ImportedPostSchema = BlogPostSchema.extend({
    published: z.literal(true),
    lang: z.enum(['zh', 'en']),
});
