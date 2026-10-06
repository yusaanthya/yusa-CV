import { cn } from "@/lib/utils";

interface TagListProps {
    tags: string[];
    className?: string;
}

export function TagList({ tags, className }: TagListProps) {
    return (
        <ul className={cn("flex flex-wrap gap-2", className)}>
            {tags.map((tag) => (
                <li key={tag} className="border border-line px-2 py-0.5 text-xs text-mute">
                    {tag}
                </li>
            ))}
        </ul>
    );
}
