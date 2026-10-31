"use client";

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
    blogListQuery,
    detectPreferredLang,
    listArticles,
    parseBlogListState,
    STATIC_DISPLAY_LANG,
} from "../services/post-groups.mjs";
import type { BlogArticleSummary, BlogDisplayLang, BlogListState, BlogTagCount } from "../types";
import { ArticleList } from "./article-list";
import { LanguageToggle } from "./language-toggle";
import { TagPicker } from "./tag-picker";

interface BlogListProps {
    articles: BlogArticleSummary[];
    tagCounts: BlogTagCount[];
}

function subscribeLanguages(onChange: () => void) {
    window.addEventListener("languagechange", onChange);
    return () => window.removeEventListener("languagechange", onChange);
}

function browserLangSnapshot(): BlogDisplayLang {
    return detectPreferredLang(navigator.languages ?? []);
}

function staticLangSnapshot(): BlogDisplayLang {
    return STATIC_DISPLAY_LANG;
}

/** A query-only relative URL keeps whatever base path the location already has. */
function pushListState(next: BlogListState) {
    const query = blogListQuery(next);
    window.history.pushState(null, "", query || window.location.pathname);
}

export function BlogList({ articles, tagCounts }: BlogListProps) {
    // The URL plus the browser default is the only list state, so history and copied URLs just work.
    const searchParams = useSearchParams();
    const { lang, tag } = parseBlogListState(
        searchParams,
        tagCounts.map((option) => option.tag)
    );
    const browserLang = useSyncExternalStore(subscribeLanguages, browserLangSnapshot, staticLangSnapshot);
    const displayLang = lang ?? browserLang;
    const entries = listArticles(articles, displayLang, tag);

    const noun = entries.length === 1 ? "article" : "articles";

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <TagPicker
                    options={tagCounts}
                    selected={tag}
                    onSelect={(chosen) => pushListState({ lang, tag: chosen })}
                />
                <LanguageToggle value={displayLang} onChange={(chosen) => pushListState({ lang: chosen, tag })} />
            </div>
            <p aria-live="polite" className="mb-6 mt-3 text-sm text-mute">
                {entries.length} {noun}
                {tag !== null && <> tagged {tag}</>}
            </p>
            <ArticleList entries={entries} displayLang={displayLang} selectedTag={tag} />
        </>
    );
}
