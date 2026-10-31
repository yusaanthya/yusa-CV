import Link from "next/link";
import type { BlogArticleSummary, BlogArticleVersion, BlogDisplayLang } from "../types";
import { CONTENT_LANGUAGE, LANGUAGE_LABELS } from "../services/post-groups.mjs";
import { formatDate, cn } from "@/lib/utils";

interface PostCardProps {
    article: BlogArticleSummary;
    version: BlogArticleVersion;
    /** The list's display language, used only to mark a single-language card shown as a fallback. */
    displayLang?: BlogDisplayLang;
    /** The tag the list is filtered by, emphasised among the card's tags. */
    selectedTag?: string | null;
    className?: string;
}

export function PostCard({ article, version, displayLang, selectedTag, className }: PostCardProps) {
    const contentLang = version.lang ? CONTENT_LANGUAGE[version.lang] : undefined;

    return (
        <article
            className={cn(
                "group relative border border-line bg-surface p-6 transition-[border-color,transform] duration-150",
                "hover:border-ink active:scale-[0.99] motion-reduce:active:scale-100",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                className
            )}
        >
            <div className="flex items-baseline justify-between gap-3 text-sm text-mute">
                <time dateTime={article.date}>{formatDate(article.date)}</time>
                <LanguageMarker article={article} version={version} displayLang={displayLang} />
            </div>
            <h2 lang={contentLang} className="mt-1 font-display text-[1.4rem] leading-snug">
                {/* The stretched link makes the whole frame a single tap target. */}
                <Link
                    href={`/blog/${version.slug}/`}
                    className="after:absolute after:inset-0 group-hover:text-accent focus-visible:outline-none"
                >
                    {version.title}
                </Link>
            </h2>
            <p lang={contentLang} className="mt-2 line-clamp-2 text-mute">
                {version.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                    <li
                        key={tag}
                        className={cn(
                            "border px-2 py-0.5 text-xs",
                            tag === selectedTag ? "border-ink font-semibold text-ink" : "border-line text-mute"
                        )}
                    >
                        {tag}
                    </li>
                ))}
            </ul>
        </article>
    );
}

function LanguageMarker({
    article,
    version,
    displayLang,
}: Pick<PostCardProps, "article" | "version" | "displayLang">) {
    const labelled = article.versions.filter((v) => v.lang !== undefined);

    if (article.versions.length > 1) {
        // Siblings of the title, lifted above its stretched link so each stays clickable.
        return (
            <ul aria-label="Languages" className="relative z-10 flex items-baseline gap-1">
                {labelled.map((v) => {
                    const current = v.slug === version.slug;
                    const lang = v.lang!;
                    return (
                        <li key={v.slug}>
                            <Link
                                href={`/blog/${v.slug}/`}
                                lang={CONTENT_LANGUAGE[lang]}
                                hrefLang={CONTENT_LANGUAGE[lang]}
                                aria-current={current ? "true" : undefined}
                                className={cn(
                                    "inline-flex min-h-6 items-center px-1.5 underline-offset-4 decoration-accent decoration-2",
                                    "hover:text-ink hover:underline",
                                    current && "font-semibold text-ink underline"
                                )}
                            >
                                {LANGUAGE_LABELS[lang]}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        );
    }

    // An unlabelled legacy post claims no language.
    if (!version.lang) return null;

    // A single version is always the one displayed; under the other display language it is a fallback.
    const fallback = displayLang !== undefined && displayLang !== version.lang;
    return (
        <span
            lang={CONTENT_LANGUAGE[version.lang]}
            className={cn(fallback && "border border-dashed border-mute px-1.5")}
        >
            {LANGUAGE_LABELS[version.lang]}
            {fallback && <span lang="en"> only</span>}
        </span>
    );
}
