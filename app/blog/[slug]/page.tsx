import { notFound } from "next/navigation";
import { BlogService } from "@/features/blog/services/post-service";
import { Container } from "@/features/ui/components/container";
import { TagList } from "@/features/blog/components/tag-list";
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
        <Container className="py-16 sm:py-20">
            <article className="prose prose-game max-w-none">
                <header className="not-prose mb-12">
                    <time dateTime={post.date} className="text-sm text-mute">
                        {formatDate(post.date)}
                    </time>
                    <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">
                        {post.title}
                    </h1>
                    <TagList tags={post.tags} className="mt-5" />
                </header>

                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </article>
        </Container>
    );
}
