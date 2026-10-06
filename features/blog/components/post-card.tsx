import Link from "next/link";
import { BlogPost } from "../types";
import { formatDate, cn } from "@/lib/utils";
import { TagList } from "./tag-list";

interface PostCardProps {
    post: BlogPost;
    className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
    return (
        <article className={cn("relative py-7", className)}>
            <time dateTime={post.date} className="text-sm text-mute">
                {formatDate(post.date)}
            </time>
            <h2 className="mt-1 font-display text-2xl leading-snug">
                {/* The stretched link makes the whole entry a single tap target. */}
                <Link
                    href={`/blog/${post.slug}`}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                >
                    <span className="menu-cursor">{post.title}</span>
                </Link>
            </h2>
            <p className="mt-2 line-clamp-2 text-mute">{post.description}</p>
            <TagList tags={post.tags} className="mt-4" />
        </article>
    );
}
