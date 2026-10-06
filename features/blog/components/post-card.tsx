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
        <article
            className={cn(
                "group relative border border-line bg-surface p-6 transition-[border-color,transform] duration-150",
                "hover:border-ink active:scale-[0.99] motion-reduce:active:scale-100",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                className
            )}
        >
            <time dateTime={post.date} className="text-sm text-mute">
                {formatDate(post.date)}
            </time>
            <h2 className="mt-1 font-display text-[1.4rem] leading-snug">
                {/* The stretched link makes the whole frame a single tap target. */}
                <Link
                    href={`/blog/${post.slug}`}
                    className="after:absolute after:inset-0 group-hover:text-accent focus-visible:outline-none"
                >
                    {post.title}
                </Link>
            </h2>
            <p className="mt-2 line-clamp-2 text-mute">{post.description}</p>
            <TagList tags={post.tags} className="mt-4" />
        </article>
    );
}
