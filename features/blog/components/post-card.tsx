import Link from "next/link";
import { BlogPost } from "../types";
import { formatDate, cn } from "@/lib/utils";

interface PostCardProps {
    post: BlogPost;
    className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className={cn(
                "group block p-6 -mx-6 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors",
                className
            )}
        >
            <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground font-mono">
                    {formatDate(post.date)}
                </span>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {post.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2">
                    {post.description}
                </p>
                <div className="flex gap-2 mt-2">
                    {post.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
