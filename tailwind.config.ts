import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                paper: "rgb(var(--paper) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                ink: "rgb(var(--ink) / <alpha-value>)",
                mute: "rgb(var(--mute) / <alpha-value>)",
                line: "rgb(var(--line) / <alpha-value>)",
                accent: "rgb(var(--accent) / <alpha-value>)",
                "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
                plum: "rgb(var(--plum) / <alpha-value>)",
            },
            fontFamily: {
                serif: ["var(--font-serif)", "var(--font-cjk-serif)"],
                sans: ["var(--font-sans)", "var(--font-cjk-sans)"],
            },
            fontSize: {
                // Body follows Apple's 17pt default.
                base: ["1.0625rem", { lineHeight: "1.65" }],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
