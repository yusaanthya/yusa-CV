import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { assetPath } from "@/lib/utils";

interface HastNode {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
}

// Markdown images and article links need the Pages base path. External URLs stay unchanged.
function rehypeAssetPaths() {
    const walk = (node: HastNode) => {
        const src = node.properties?.src;
        if (node.tagName === "img" && typeof src === "string" && src.startsWith("/") && !src.startsWith("//")) {
            node.properties!.src = assetPath(src);
        }
        const href = node.properties?.href;
        if (node.tagName === "a" && typeof href === "string" && href.startsWith("/blog/")) {
            node.properties!.href = assetPath(href);
        }
        node.children?.forEach(walk);
    };
    return (tree: HastNode) => walk(tree);
}

export async function markdownToHtml(content: string): Promise<string> {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeAssetPaths)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(content);
    return String(result);
}
