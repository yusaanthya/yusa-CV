import { BlogService } from "@/features/blog/services/post-service";
import { Container } from "@/features/ui/components/container";
import { PostCard } from "@/features/blog/components/post-card";

export default async function BlogPage() {
    const posts = await BlogService.getAllPosts();

    return (
        <Container className="py-12 sm:py-16">
            <div className="mx-auto max-w-3xl">
                <h1 className="font-display text-5xl leading-none tracking-[-0.04em]">Blog</h1>
                <div aria-hidden className="rule mb-10 mt-6 text-ink" />
                <ul className="flex flex-col gap-3">
                    {posts.map((post) => (
                        <li key={post.slug}>
                            <PostCard post={post} />
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    );
}
