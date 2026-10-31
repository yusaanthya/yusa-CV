import { z } from 'zod';
import { BlogPostSchema } from './schema.mjs';

export { BlogPostSchema };

export type BlogLang = 'zh' | 'en';

export type BlogPost = z.infer<typeof BlogPostSchema> & {
    content: string;
    readingTime?: string;
};

/** One published version as sent to the browser. No body, no source path, no coverImage. */
export interface BlogArticleVersion {
    slug: string;
    /** Absent only for unlabelled legacy posts. */
    lang?: BlogLang;
    title: string;
    description: string;
    /** The version's own YYYY-MM-DD. */
    date: string;
}

/** One logical article (one list card). */
export interface BlogArticleSummary {
    /** `key:<translationKey>` or `slug:<slug>`; separate namespaces. */
    id: string;
    /** Earliest date among published versions. */
    date: string;
    /** Distinct union, first-seen order following `versions` order. */
    tags: string[];
    /** Ordered zh, en; an unlabelled legacy post has exactly one. */
    versions: BlogArticleVersion[];
}

/** List display language. Always one of the two; there is no "all" state. */
export type BlogDisplayLang = BlogLang;

/** List state as read from the URL. `lang: null` = use the browser default; `tag: null` = all tags. */
export interface BlogListState { lang: BlogDisplayLang | null; tag: string | null }

/** One card as rendered: the logical article plus the version it displays. */
export interface BlogListEntry { article: BlogArticleSummary; version: BlogArticleVersion }

/** `count` is the number of logical articles carrying the tag. */
export interface BlogTagCount { tag: string; count: number }
