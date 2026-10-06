"use client";

import { useEffect, useState } from "react";

interface HalftoneFadeProps {
    // The panel and the text block it must keep legible.
    containerRef: React.RefObject<HTMLElement>;
    textRef: React.RefObject<HTMLElement>;
}

interface Geometry {
    width: number;
    height: number;
    horizontal: boolean;
    edge: number;
}

const SPACING = 12;
// Dots start overlapping (solid) and shrink to nothing across the band.
const MAX_RADIUS = SPACING * 0.72;
const BAND_DESKTOP = 280;
const BAND_MOBILE = 150;
const TEXT_GAP = 32;

/**
 * A page-coloured "hole" behind the project copy that dissolves into the key art as a
 * halftone screen: solid behind the text, then dots that shrink towards the art.
 * Desktop fades rightwards from the text; phones fade upwards because the art sits above.
 */
export function HalftoneFade({ containerRef, textRef }: HalftoneFadeProps) {
    const [geometry, setGeometry] = useState<Geometry | null>(null);

    // A passive effect, not a layout effect: refs on the parent panel and the sibling copy
    // are only guaranteed attached once the whole commit has finished.
    useEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;
        if (!container || !text) return;

        const measure = () => {
            const box = container.getBoundingClientRect();
            const copy = text.getBoundingClientRect();
            const horizontal = box.width >= 640;
            setGeometry({
                width: box.width,
                height: box.height,
                horizontal,
                edge: horizontal ? copy.right - box.left + TEXT_GAP : copy.top - box.top - TEXT_GAP,
            });
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        observer.observe(text);
        return () => observer.disconnect();
    }, [containerRef, textRef]);

    // Before measuring, a plain solid block keeps the copy readable.
    if (!geometry) {
        return (
            <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--paper))_55%,transparent_75%)] sm:bg-[linear-gradient(to_right,rgb(var(--paper))_55%,transparent_75%)]"
            />
        );
    }

    const { width, height, horizontal, edge } = geometry;
    const band = horizontal ? BAND_DESKTOP : BAND_MOBILE;
    const dots: JSX.Element[] = [];
    const along = horizontal ? height : width;

    for (let step = 0; step * SPACING < band; step++) {
        const t = (step * SPACING) / band;
        const r = MAX_RADIUS * Math.pow(1 - t, 1.3);
        if (r < 0.6) break;
        // Offset alternate rows for a classic diagonal screen.
        for (let j = 0; j * SPACING < along + SPACING; j++) {
            const across = j * SPACING + (step % 2 ? SPACING / 2 : 0);
            const main = horizontal ? edge + step * SPACING : edge - step * SPACING;
            const [cx, cy] = horizontal ? [main, across] : [across, main];
            dots.push(<circle key={`${step}-${j}`} cx={cx} cy={cy} r={r} />);
        }
    }

    return (
        <svg
            aria-hidden
            width={width}
            height={height}
            className="absolute inset-0 fill-paper"
        >
            {horizontal ? (
                <rect x={0} y={0} width={Math.max(edge, 0)} height={height} />
            ) : (
                <rect x={0} y={Math.max(edge, 0)} width={width} height={Math.max(height - edge, 0)} />
            )}
            {dots}
        </svg>
    );
}
