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
    // Desktop only: the copy's top-left corner within the panel.
    copyLeft: number;
    copyTop: number;
}

const SPACING = 11;
// Every dot is the same size; tone comes from how many grid cells carry one (an ordered
// screen, like silkscreen). Dots sit on a hexagonal grid and are just large enough for
// neighbours to merge (≥ spacing/√3) without the cross-shaped gaps a square grid leaves.
// Density never reaches 1, so the field always keeps some open cells instead of going solid.
const ROW_SPACING = (SPACING * Math.sqrt(3)) / 2;
const DOT_RADIUS = SPACING * 0.6;
const MAX_DENSITY = 0.96;
const TEXT_GAP = 32;
// Density ramps from 0 at the curve to MAX_DENSITY over this depth, so the screen is
// dense right below the curve and the gradient stays at its edge.
const FADE_DEPTH = 100;
const MOBILE_FADE = 150;

// The screen's top edge, as fractions of the panel: rises slightly from the left edge,
// then sweeps down to the right, leaving the art's focal area clear.
const CURVE: [number, number][] = [
    [0, 0.42],
    [0.1, 0.35],
    [0.22, 0.32],
    [0.34, 0.33],
    [0.42, 0.38],
    [0.5, 0.47],
    [0.57, 0.63],
    [0.72, 0.79],
    [1, 0.88],
];

const smoothstep = (x: number) => {
    const t = Math.min(Math.max(x, 0), 1);
    return t * t * (3 - 2 * t);
};

function curveY(u: number) {
    for (let i = 1; i < CURVE.length; i++) {
        const [x0, y0] = CURVE[i - 1];
        const [x1, y1] = CURVE[i];
        if (u <= x1) return y0 + (y1 - y0) * smoothstep((u - x0) / (x1 - x0));
    }
    return CURVE[CURVE.length - 1][1];
}

// 8×8 Bayer threshold matrix for the ordered screen.
const BAYER: number[][] = (() => {
    let m = [[0]];
    while (m.length < 8) {
        const k = m.length;
        m = Array.from({ length: 2 * k }, (_, i) =>
            Array.from({ length: 2 * k }, (_, j) => 4 * m[i % k][j % k] + [0, 2, 3, 1][Math.floor(i / k) * 2 + Math.floor(j / k)]),
        );
    }
    return m;
})();
const threshold = (row: number, col: number) => (BAYER[row % 8][col % 8] + 0.5) / 64;

/**
 * A page-coloured screen of equal dots that dissolves into the key art by density.
 * Desktop: it fills the area below a curve that sweeps from the left edge down to the
 * bottom right. Phones: the copy spans the full width, so the screen fades upwards from
 * just above it instead.
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
                copyLeft: copy.left - box.left,
                copyTop: copy.top - box.top,
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

    const { width, height, diagonal, edge, copyLeft, copyTop } = geometry;
    const dots: JSX.Element[] = [];

    if (diagonal) {
        // The curve's shape comes from CURVE, but its left part is anchored to the copy so the
        // whole fade band ends above the title; the shift tapers to zero at the right edge.
        const lift = copyTop - TEXT_GAP - FADE_DEPTH - curveY(copyLeft / width) * height;
        const edgeY = (u: number) => curveY(u) * height + lift * (1 - u);
        for (let row = 0; row * ROW_SPACING < height + SPACING; row++) {
            const cy = row * ROW_SPACING;
            const shift = row % 2 ? SPACING / 2 : 0;
            for (let col = 0; col * SPACING < width + SPACING; col++) {
                const cx = col * SPACING + shift;
                const depth = cy - edgeY(cx / width);
                const density = MAX_DENSITY * smoothstep(depth / FADE_DEPTH);
                if (density <= threshold(row, col)) continue;
                dots.push(<circle key={`${row}-${col}`} cx={cx} cy={cy} r={DOT_RADIUS} />);
            }
        }
        return (
            <svg aria-hidden width={width} height={height} className="absolute inset-0 fill-paper">
                {dots}
            </svg>
        );
    }

    for (let row = 0; row * ROW_SPACING < height + SPACING; row++) {
        const cy = row * ROW_SPACING;
        const shift = row % 2 ? SPACING / 2 : 0;
        const density = MAX_DENSITY * smoothstep((cy - (edge - MOBILE_FADE)) / MOBILE_FADE);
        if (density <= 0) continue;
        if (cy >= edge) break;
        for (let col = 0; col * SPACING < width + SPACING; col++) {
            if (density <= threshold(row, col)) continue;
            dots.push(
                <circle key={`${row}-${col}`} cx={col * SPACING + shift} cy={cy} r={DOT_RADIUS} />,
            );
        }
    }
    return (
        <svg aria-hidden width={width} height={height} className="absolute inset-0 fill-paper">
            <rect x={0} y={Math.max(edge, 0)} width={width} height={Math.max(height - edge, 0)} />
            {dots}
        </svg>
    );
}
