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
    diagonal: boolean;
    // Phones only: where the solid block under the copy begins.
    edge: number;
}

const SPACING = 13;
// Dots start overlapping (solid) and shrink to nothing across the band.
const MAX_RADIUS = SPACING * 0.72;
const GOLDEN = (1 + Math.sqrt(5)) / 2;
// Desktop: the solid corner covers ~10% of the panel; the dot band runs φ^1.5 times its leg.
// Chosen by simulating art exposure against coverage behind the copy at 1024–1600px:
// ~52–56% of the art stays visible while the summary keeps ~85–91% coverage (the title,
// set larger, ~62–68% plus a halo). φ² covered too much art; φ left the summary thin.
const SOLID_AREA = 0.1;
const BAND_RATIO = Math.pow(GOLDEN, 1.5);
const BAND_MOBILE = 150;
const TEXT_GAP = 32;

// Holds dots large near the solid area and tapers late, so the screen stays dense
// behind the copy before thinning out into the art.
const radiusAt = (t: number) => MAX_RADIUS * (1 - Math.pow(t, 1.5));

/**
 * A page-coloured "hole" that dissolves into the key art as a halftone screen.
 * Desktop: a 45° screen from the bottom-left corner — a solid corner of ~10% of the panel,
 * then dots that shrink over a golden-ratio band. Phones: the copy spans the full width,
 * so the screen fades upwards from just above it instead.
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
            setGeometry({
                width: box.width,
                height: box.height,
                diagonal: box.width >= 640,
                edge: copy.top - box.top - TEXT_GAP,
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
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--paper))_55%,transparent_75%)] sm:bg-[linear-gradient(45deg,rgb(var(--paper))_30%,transparent_60%)]"
            />
        );
    }

    const { width, height, diagonal, edge } = geometry;
    const dots: JSX.Element[] = [];

    if (diagonal) {
        // Distance from the bottom-left corner measured along the 45° axis, in "leg" units
        // (x + distance from the bottom), so the solid corner is an isosceles right triangle.
        const solidLeg = Math.sqrt(2 * SOLID_AREA * width * height);
        const band = solidLeg * BAND_RATIO;
        for (let row = 0; row * SPACING < height + SPACING; row++) {
            const cy = height - row * SPACING;
            const shift = row % 2 ? SPACING / 2 : 0;
            for (let col = 0; col * SPACING < width + SPACING; col++) {
                const cx = col * SPACING + shift;
                const leg = cx + (height - cy);
                // Start one row inside the solid corner so dots overlap its edge; otherwise
                // the anti-aliased hypotenuse leaves slivers of art showing through.
                if (leg < solidLeg - SPACING) continue;
                const t = Math.max(0, (leg - solidLeg) / band);
                if (t >= 1) break;
                const r = radiusAt(t);
                if (r < 0.6) break;
                dots.push(<circle key={`${row}-${col}`} cx={cx} cy={cy} r={r} />);
            }
        }
        return (
            <svg aria-hidden width={width} height={height} className="absolute inset-0 fill-paper">
                <polygon points={`0,${height - solidLeg} 0,${height} ${solidLeg},${height}`} />
                {dots}
            </svg>
        );
    }

    for (let step = 0; step * SPACING < BAND_MOBILE; step++) {
        const r = radiusAt((step * SPACING) / BAND_MOBILE);
        if (r < 0.6) break;
        for (let col = 0; col * SPACING < width + SPACING; col++) {
            const cx = col * SPACING + (step % 2 ? SPACING / 2 : 0);
            dots.push(<circle key={`${step}-${col}`} cx={cx} cy={edge - step * SPACING} r={r} />);
        }
    }
    return (
        <svg aria-hidden width={width} height={height} className="absolute inset-0 fill-paper">
            <rect x={0} y={Math.max(edge, 0)} width={width} height={Math.max(height - edge, 0)} />
            {dots}
        </svg>
    );
}
