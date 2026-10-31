"use client";

import { CONTENT_LANGUAGE, LANGUAGE_LABELS } from "@/features/blog/services/post-groups.mjs";
import type { BlogDisplayLang } from "../types";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
    value: BlogDisplayLang;
    onChange(lang: BlogDisplayLang): void;
}

const LANGS: BlogDisplayLang[] = ["zh", "en"];

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
    return (
        <div role="group" aria-label="Article language" className="flex shrink-0 border border-ink">
            {LANGS.map((lang) => {
                const pressed = lang === value;
                return (
                    <button
                        key={lang}
                        type="button"
                        lang={lang === "zh" ? CONTENT_LANGUAGE.zh : undefined}
                        aria-pressed={pressed}
                        // Pressing the side that is already shown changes nothing, not even the URL.
                        onClick={() => {
                            if (!pressed) onChange(lang);
                        }}
                        className={cn(
                            "min-h-11 min-w-[3.75rem] px-3 text-sm transition-colors",
                            "underline-offset-4 decoration-accent decoration-2",
                            pressed ? "bg-ink font-semibold text-paper underline" : "text-mute hover:text-ink"
                        )}
                    >
                        {LANGUAGE_LABELS[lang]}
                    </button>
                );
            })}
        </div>
    );
}
