import type { BlogDisplayLang, BlogListEntry } from "../types";
import { PostCard } from "./post-card";

interface ArticleListProps {
    entries: BlogListEntry[];
    displayLang?: BlogDisplayLang;
    selectedTag?: string | null;
}

/** Server-safe card list shared by the static fallback and the interactive list. */
export function ArticleList({ entries, displayLang, selectedTag }: ArticleListProps) {
    return (
        <ul className="flex flex-col gap-3">
            {entries.map(({ article, version }) => (
                <li key={article.id}>
                    <PostCard article={article} version={version} displayLang={displayLang} selectedTag={selectedTag} />
                </li>
            ))}
        </ul>
    );
}
