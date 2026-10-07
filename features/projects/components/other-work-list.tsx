"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
                        <OtherWorkRow item={item} index={index} />
                    </ScrollLag>
                </li>
            ))}
        </ul>
    );
}

function OtherWorkRow({ item, index }: { item: OtherWork; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const shouldReduce = useReducedMotion();
    // Rows start as a bare title and unfold once scrolled well into view, one after another.
    const inView = useInView(ref, { once: true, amount: 0.9 });
    const open = inView || shouldReduce;

    const title = (
        <h3 className="font-display text-2xl leading-snug tracking-[-0.02em] sm:text-3xl">
            {item.url ? (
                <span className="text-sweep" data-text={item.title}>
                    {item.title}
                </span>
            ) : (
                item.title
            )}
        </h3>
    );

    const body = (
        <div ref={ref} className="ml-auto flex max-w-[36rem] flex-col items-end py-6 text-right">
            <div className="flex items-center gap-3">
                {title}
                {item.url && <ArrowUpRight aria-hidden className="h-5 w-5 shrink-0 text-accent" />}
            </div>
            <motion.div
                initial={false}
                animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={
                    shouldReduce
                        ? { duration: 0 }
                        : { duration: 0.65, delay: index * 0.12, ease: [0.2, 0.8, 0.2, 1] }
                }
                className="overflow-hidden"
            >
                <p className="pt-3 text-sm">
                    <span className="font-semibold text-ink">{item.year}</span>
                    <span className="ml-3 text-mute">{item.kind}</span>
                </p>
                <p className="mt-2 leading-relaxed text-mute">{item.summary}</p>
            </motion.div>
        </div>
    );

    if (!item.url) return body;

    return (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sweep-trigger block">
            {body}
            <span className="sr-only">(opens in a new tab)</span>
        </a>
    );
}
