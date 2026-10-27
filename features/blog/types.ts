import { z } from 'zod';
import { BlogPostSchema } from './schema.mjs';

export { BlogPostSchema };

export type BlogPost = z.infer<typeof BlogPostSchema> & {
    content: string;
    readingTime?: string;
};
