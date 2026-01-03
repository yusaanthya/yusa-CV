import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Generic function to read markdown files from a subdirectory.
 * Acts like a simple File-System DAO.
 */
export async function getHelpers<T extends z.ZodTypeAny>(
    directory: string,
    schema: T
) {
    const dirPath = path.join(CONTENT_DIR, directory);

    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const files = fs.readdirSync(dirPath);

    const items = files
        .filter((file) => file.endsWith('.md'))
        .map((file) => {
            const filePath = path.join(dirPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);

            const parsedData = schema.safeParse({
                ...data,
                slug: file.replace('.md', ''),
            });

            if (!parsedData.success) {
                console.error(`Invalid frontmatter in ${file}`, parsedData.error);
                return null; // Skip invalid files, or we could throw
            }

            return {
                ...parsedData.data,
                content,
            };
        })
        .filter(Boolean) as (z.infer<T> & { content: string })[];

    // Sort by date desc if 'date' exists
    return items.sort((a, b) => {
        if ('date' in a && 'date' in b) {
            return (new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
        }
        return 0;
    });
}

export async function getBySlug<T extends z.ZodTypeAny>(
    directory: string,
    slug: string,
    schema: T
) {
    const filePath = path.join(CONTENT_DIR, directory, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const parsedData = schema.safeParse({
        ...data,
        slug,
    });

    if (!parsedData.success) {
        throw new Error(`Invalid frontmatter in ${slug}`);
    }

    return {
        ...parsedData.data,
        content,
    } as (z.infer<T> & { content: string });
}
