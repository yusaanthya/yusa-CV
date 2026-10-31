import Link from "next/link";
import { CONTENT_LANGUAGE, LANGUAGE_LABELS } from "../services/post-groups.mjs";
import type { BlogArticleVersion } from "../types";
import { cn } from "@/lib/utils";

interface ArticleLanguageSwitchProps {
    /** Published versions of the article, ordered zh, en. */
    versions: BlogArticleVersion[];
    currentSlug: string;
    className?: string;
}

/** Links between published language versions of one article. Renders nothing for a single version. */
export function ArticleLanguageSwitch({ versions, currentSlug, className }: ArticleLanguageSwitchProps) {
    const labelled = versions.filter((version) => version.lang);
    if (labelled.length < 2) return null;

    return (
        <nav aria-label="Article language" className={className}>
            <ul className="flex items-center divide-x divide-line text-sm">
                {labelled.map((version) => {
                    const lang = version.lang!;
                    const item = "inline-flex min-h-11 items-center underline-offset-[6px] decoration-accent decoration-2";
                    return (
                        <li key={version.slug} className="px-3 first:pl-0">
                            {version.slug === currentSlug ? (
                                <span
                                    aria-current="page"
                                    lang={CONTENT_LANGUAGE[lang]}
                                    className={cn(item, "font-semibold underline")}
                                >
                                    {LANGUAGE_LABELS[lang]}
                                </span>
                            ) : (
                                <Link
                                    href={`/blog/${version.slug}/`}
                                    lang={CONTENT_LANGUAGE[lang]}
                                    hrefLang={CONTENT_LANGUAGE[lang]}
                                    className={cn(item, "text-mute hover:text-ink hover:underline")}
                                >
                                    {LANGUAGE_LABELS[lang]}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
