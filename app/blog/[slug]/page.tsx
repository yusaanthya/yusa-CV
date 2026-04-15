import { notFound } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { BlogService } from "@/features/blog/services/post-service";
import { Container } from "@/features/ui/components/container";
import { formatDate } from "@/lib/utils";

async function markdownToHtml(content: string): Promise<string> {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(content);
    return String(result);
}

interface Props {
    params: {
        slug: string;
    };
}

// SSG: Generate params for all posts
export async function generateStaticParams() {
    const posts = await BlogService.getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: Props) {
    const post = await BlogService.getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const htmlContent = await markdownToHtml(post.content);

    return (
        <Container className="py-20">
            <article className="prose prose-neutral dark:prose-invert max-w-none">
                <header className="mb-10 not-prose">
                    <time className="text-sm text-muted-foreground font-mono">
                        {formatDate(post.date)}
                    </time>
                    <h1 className="text-3xl font-bold mt-2 tracking-tight">{post.title}</h1>
                    <div className="flex gap-2 mt-4">
                        {post.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </header>

                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </article>
        </Container>
    );
}
