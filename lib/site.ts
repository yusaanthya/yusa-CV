import { assetPath } from "./utils";

// Declared production origin for absolute metadata URLs; never inferred from a request.
export const SITE_ORIGIN = "https://yusaanthya.github.io";

/** Prefixes the build's base path (NEXT_PUBLIC_BASE_PATH) and the site origin. */
export function absoluteUrl(path: string): string {
    return `${SITE_ORIGIN}${assetPath(path)}`;
}

export function articleUrl(slug: string): string {
    return absoluteUrl(`/blog/${slug}/`);
}
