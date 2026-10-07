import { ScrollLag } from "@/features/ui/components/scroll-lag";
import { OtherWork } from "../projects";

interface OtherWorkListProps {
    items: OtherWork[];
}

export function OtherWorkList({ items }: OtherWorkListProps) {
    return (
        <ul>
            {items.map((item, index) => (
                // Each row trails a little more than the one above, so the list cascades on scroll.
                <li key={item.slug}>
                    <ScrollLag layer={1 + index * 0.25}>
                        <OtherWorkRow item={item} />
                    </ScrollLag>
                </li>
            ))}
        </ul>
    );
}

function OtherWorkRow({ item }: { item: OtherWork }) {
    const content = (
        <>
            <h3 className="ow-title font-display text-2xl leading-snug tracking-[-0.02em] sm:text-3xl">
                <span className="text-sweep" data-text={item.title}>
                    {item.title}
                </span>
            </h3>
            {/* Collapsed until the title is hovered or focused; always open without hover. */}
            <div className="ow-detail">
                <div>
                    <p className="pt-3 text-sm">
                        <span className="font-semibold text-ink">{item.year}</span>
                        <span className="ml-3 text-mute">{item.kind}</span>
                    </p>
                    <p className="mt-2 leading-relaxed text-mute">{item.summary}</p>
                </div>
            </div>
        </>
    );
    const className = "ow-row text-sweep-trigger ml-auto block w-fit max-w-[36rem] py-5 text-right";

    if (item.url) {
        return (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
                <span className="sr-only">(opens in a new tab)</span>
            </a>
        );
    }

    // Focusable so keyboard users can reveal the details too; it is not a link.
    return (
        <div tabIndex={0} className={`${className} cursor-default`}>
            {content}
        </div>
    );
}
