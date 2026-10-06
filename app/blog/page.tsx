import { BlogService } from "@/features/blog/services/post-service";
import { Container } from "@/features/ui/components/container";
import { PostCard } from "@/features/blog/components/post-card";

export default async function BlogPage() {
    const posts = await BlogService.getAllPosts();

    return (
        <Container className="py-16 sm:py-20">
            <div className="max-w-2xl">
                <h1 className="mb-10 font-display text-5xl">Blog</h1>
                <ul className="border-t-2 border-dashed border-haze">
                    {posts.map((post) => (
                        <li key={post.slug} className="border-b-2 border-dashed border-haze">
                            <PostCard post={post} />
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    );
}
