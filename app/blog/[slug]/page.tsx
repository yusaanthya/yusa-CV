import { notFound } from "next/navigation";
import { BlogService } from "@/features/blog/services/post-service";
import { Container } from "@/features/ui/components/container";
import { TagList } from "@/features/ui/components/tag-list";
import { formatDate } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";

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
        <Container className="py-12 sm:py-16">
            <article className="mx-auto max-w-3xl">
                <header className="mb-12 max-w-[68ch]">
                    <time dateTime={post.date} className="text-sm text-mute">
                        {formatDate(post.date)}
                    </time>
                    <h1 className="mt-2 font-display text-4xl leading-[1.1] tracking-[-0.04em] sm:text-5xl">
                        {post.title}
                    </h1>
                    <TagList tags={post.tags} className="mt-5" />
                    <div aria-hidden className="rule mt-8 text-ink" />
                </header>

                <div
                    className="prose prose-site"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </article>
        </Container>
    );
}
