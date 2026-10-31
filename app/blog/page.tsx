import { Suspense } from "react";
import { BlogService } from "@/features/blog/services/post-service";
import { countTags, listArticles, STATIC_DISPLAY_LANG } from "@/features/blog/services/post-groups.mjs";
import { Container } from "@/features/ui/components/container";
import { ArticleList } from "@/features/blog/components/article-list";
import { BlogList } from "@/features/blog/components/blog-list";

export default async function BlogPage() {
    const articles = await BlogService.getArticleSummaries();
    const tagCounts = countTags(articles);

    // The exported HTML holds only the Suspense fallback: the full Chinese-first list with
    // working links and no controls. That is also the page without JavaScript.
    const fallback = (
        <ArticleList entries={listArticles(articles, STATIC_DISPLAY_LANG, null)} displayLang={STATIC_DISPLAY_LANG} />
    );

    return (
        <Container className="py-12 sm:py-16">
            <div className="mx-auto max-w-3xl">
                <h1 className="font-display text-5xl leading-none tracking-[-0.04em]">Blog</h1>
                <div aria-hidden className="rule mb-6 mt-6 text-ink" />
                <Suspense fallback={fallback}>
                    <BlogList articles={articles} tagCounts={tagCounts} />
                </Suspense>
            </div>
        </Container>
    );
}
