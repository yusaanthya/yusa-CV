import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { assetPath } from "@/lib/utils";

interface HastNode {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
}

// Markdown images pointing into public/ (e.g. /images/posts/...) need the Pages base path,
// which the markdown pipeline does not add on its own. External URLs are left alone.
function rehypeAssetPaths() {
    const walk = (node: HastNode) => {
        const src = node.properties?.src;
        if (node.tagName === "img" && typeof src === "string" && src.startsWith("/")) {
            node.properties!.src = assetPath(src);
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
        .use(rehypeAssetPaths)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(content);
    return String(result);
}
