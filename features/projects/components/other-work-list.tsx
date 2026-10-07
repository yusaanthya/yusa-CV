import { ArrowUpRight } from "lucide-react";
import { ScrollLag } from "@/features/ui/components/scroll-lag";
import { OtherWork } from "../projects";

interface OtherWorkListProps {
    items: OtherWork[];
}

export function OtherWorkList({ items }: OtherWorkListProps) {
    return (
        <ul className="border-t border-line">
            {items.map((item, index) => (
                // Each row trails a little more than the one above, so the list cascades on scroll.
                <li key={item.slug} className="border-b border-line">
                    <ScrollLag layer={1 + index * 0.25}>
                        <OtherWorkRow item={item} />
                    </ScrollLag>
                </li>
            ))}
        </ul>
    );
}

function OtherWorkRow({ item }: { item: OtherWork }) {
    const body = (
        <div className="grid gap-x-10 gap-y-2 py-7 sm:grid-cols-[8rem_1fr_auto]">
            <div className="flex items-baseline gap-3 text-sm sm:flex-col sm:gap-1">
                <span className="font-semibold text-ink">{item.year}</span>
                <span className="text-mute">{item.kind}</span>
            </div>
            <div className="max-w-[60ch]">
                <h3 className="font-display text-2xl leading-snug tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-mute">{item.summary}</p>
            </div>
            {item.url && (
                <ArrowUpRight
                    aria-hidden
                    className="hidden h-5 w-5 self-center text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block"
                />
            )}
        </div>
    );

    if (!item.url) return body;

    return (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block hover:text-accent">
            {body}
            <span className="sr-only">(opens in a new tab)</span>
        </a>
    );
}
