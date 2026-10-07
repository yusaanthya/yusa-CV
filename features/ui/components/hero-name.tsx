"use client";

import { useEffect } from "react";

// Two lines, typed in order: "Yusa", a short pause like pressing Enter, then "Liu".
const LINES = ["Yusa", "Liu"];
const START_MS = 350;
const CHAR_MS = 85;
const LINE_PAUSE_MS = 160;
// The caret blinks a few times after typing, then disappears.
const BLINK_MS = 1000;
const BLINKS = 4;

const TOTAL_CHARS = LINES.join("").length;
export const HERO_TYPE_DONE_MS = START_MS + TOTAL_CHARS * CHAR_MS + LINE_PAUSE_MS;

/**
 * The hero name, typed out once per session with a caret that follows it. The full text is
 * in the HTML, so it reads the same without JS, to search engines and to screen readers;
 * typing is a CSS reveal. Under reduced motion, or after the first visit in a session, the
 * name renders complete (see the head script in app/layout.tsx and .type-* in globals.css).
 */
export function HeroName({ className, style }: { className?: string; style?: React.CSSProperties }) {
    useEffect(() => {
        // Mark the session once typing has finished, so returning to Home shows the name at once.
        const id = window.setTimeout(() => {
            document.documentElement.dataset.typed = "1";
            try {
                sessionStorage.setItem("hero-typed", "1");
            } catch {
                // Storage can be unavailable; the name still renders.
            }
        }, HERO_TYPE_DONE_MS + BLINK_MS * BLINKS);
        return () => window.clearTimeout(id);
    }, []);

    let index = 0;
    return (
        <h1 aria-label={LINES.join(" ")} className={className} style={style}>
            {LINES.map((line, lineIndex) => (
                <span key={line} aria-hidden className="block">
                    {[...line].map((char) => {
                        const at = START_MS + index * CHAR_MS + lineIndex * LINE_PAUSE_MS;
                        const isLast = index === TOTAL_CHARS - 1;
                        index += 1;
                        return (
                            <span
                                key={`${lineIndex}-${char}-${at}`}
                                className={isLast ? "type-char type-char-last" : "type-char"}
                                style={
                                    {
                                        "--at": `${at}ms`,
                                        "--slot": `${CHAR_MS + (lineIndex === 0 && char === line.at(-1) ? LINE_PAUSE_MS : 0)}ms`,
                                        "--blink": `${BLINK_MS}ms`,
                                        "--blinks": BLINKS,
                                    } as React.CSSProperties
                                }
                            >
                                {char}
                            </span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
}
