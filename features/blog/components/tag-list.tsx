import { cn } from "@/lib/utils";

interface TagListProps {
    tags: string[];
    className?: string;
}

export function TagList({ tags, className }: TagListProps) {
    return (
        <ul className={cn("flex flex-wrap gap-2", className)}>
            {tags.map((tag) => (
                <li
                    key={tag}
                    className="rounded-full border-2 border-pop px-3 py-0.5 text-xs text-ink"
                >
                    {tag}
                </li>
            ))}
        </ul>
    );
}
