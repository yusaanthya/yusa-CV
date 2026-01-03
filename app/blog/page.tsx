import { BlogService } from "@/features/blog/services/post-service";
import { Container } from "@/features/ui/components/container";
import { PostCard } from "@/features/blog/components/post-card";

export default async function BlogPage() {
    const posts = await BlogService.getAllPosts();

    return (
        <Container className="py-20">
            <div className="max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight mb-8">Blog</h1>
                <div className="flex flex-col gap-4">
                    {posts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            </div>
        </Container>
    );
}
