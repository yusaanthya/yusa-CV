import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogService } from "@/features/blog/services/post-service";
import { CONTENT_LANGUAGE } from "@/features/blog/services/post-groups.mjs";
import { ArticleLanguageSwitch } from "@/features/blog/components/article-language-switch";
import { Container } from "@/features/ui/components/container";
import { TagList } from "@/features/ui/components/tag-list";
import { formatDate } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";
import { articleUrl } from "@/lib/site";

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

// Each version carries its own title, description and canonical URL. Labelled versions also
// list every published version of the article (itself included), so alternates are reciprocal.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await BlogService.getPostBySlug(params.slug);
    if (!post) return {};

    const alternates: NonNullable<Metadata["alternates"]> = { canonical: articleUrl(post.slug) };
    if (post.lang) {
        const versions = await BlogService.getArticleVersions(post.slug);
        alternates.languages = Object.fromEntries(
            versions.flatMap((version) =>
                version.lang ? [[CONTENT_LANGUAGE[version.lang], articleUrl(version.slug)]] : []
            )
        );
    }

    return {
        title: post.title,
        description: post.description,
        alternates,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const post = await BlogService.getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const [htmlContent, versions] = await Promise.all([
        markdownToHtml(post.content),
        BlogService.getArticleVersions(post.slug),
    ]);
    // Unlabelled legacy posts keep inheriting the document language.
    const contentLang = post.lang ? CONTENT_LANGUAGE[post.lang] : undefined;

    return (
        <Container className="py-12 sm:py-16">
            <article className="mx-auto max-w-3xl">
                <header className="mb-12 max-w-[68ch]">
                    <time dateTime={post.date} className="text-sm text-mute">
                        {formatDate(post.date)}
                    </time>
                    <h1 lang={contentLang} className="mt-2 font-display text-4xl leading-[1.1] tracking-[-0.04em] sm:text-5xl">
                        {post.title}
                    </h1>
                    {versions.length > 1 && (
                        <ArticleLanguageSwitch versions={versions} currentSlug={post.slug} className="mt-3" />
                    )}
                    <TagList tags={post.tags} className="mt-5" />
                    <div aria-hidden className="rule mt-8 text-ink" />
                </header>

                <div
                    lang={contentLang}
                    className="prose prose-site"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </article>
        </Container>
    );
}
