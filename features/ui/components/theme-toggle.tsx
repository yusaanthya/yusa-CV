"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
    const chosen = document.documentElement.dataset.theme;
    if (chosen === "light" || chosen === "dark") return chosen;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
    // Unknown until mounted: the server cannot see the visitor's appearance.
    const [theme, setTheme] = useState<Theme | null>(null);

    useEffect(() => {
        setTheme(currentTheme());
    }, []);

    function toggle() {
        const next: Theme = currentTheme() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem("theme", next);
        } catch {
            // Storage can be unavailable (private mode); the choice still applies to this page.
        }
        setTheme(next);
    }

    const label = theme === "dark" ? "Switch to light appearance" : "Switch to dark appearance";

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={label}
            title={label}
            className="grid h-11 w-11 place-items-center rounded text-mute transition-colors hover:text-ink"
        >
            {theme === "dark" ? <Sun aria-hidden className="h-5 w-5" /> : <Moon aria-hidden className="h-5 w-5" />}
        </button>
    );
}
