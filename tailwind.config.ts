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
                panel: "rgb(var(--panel) / <alpha-value>)",
                ink: "rgb(var(--ink) / <alpha-value>)",
                mute: "rgb(var(--mute) / <alpha-value>)",
                haze: "rgb(var(--haze) / <alpha-value>)",
                marker: "rgb(var(--marker) / <alpha-value>)",
                pop: "rgb(var(--pop) / <alpha-value>)",
                // Text placed on marker/pop fills stays dark in both themes.
                "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
            },
            fontFamily: {
                display: ["var(--font-display)", "var(--font-cjk)"],
                sans: ["var(--font-body)", "var(--font-cjk)"],
            },
            fontSize: {
                // Body follows Apple's 17pt default.
                base: ["1.0625rem", { lineHeight: "1.6" }],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
