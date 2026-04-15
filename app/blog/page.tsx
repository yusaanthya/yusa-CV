import { BlogService } from "@/features/blog/services/post-service";
import { Container } from "@/features/ui/components/container";
import { PostCard } from "@/features/blog/components/post-card";
import { AnimateIn } from "@/features/ui/components/animate-in";

export default async function BlogPage() {
    const posts = await BlogService.getAllPosts();

    return (
        <Container className="py-20">
            <div className="max-w-2xl">
                <AnimateIn variant="fade-up">
                    <h1 className="text-4xl font-bold tracking-tight mb-8">Blog</h1>
                </AnimateIn>
                <div className="flex flex-col gap-4">
                    {posts.map((post, index) => (
                        <AnimateIn key={post.slug} variant="fade-up" delay={index * 0.1}>
                            <PostCard post={post} />
                        </AnimateIn>
                    ))}
                </div>
            </div>
        </Container>
    );
}
