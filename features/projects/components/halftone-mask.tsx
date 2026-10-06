"use client";

import { useEffect, useRef, useState } from "react";

interface HalftoneMaskProps {
    containerRef: React.RefObject<HTMLElement>;
    textRef: React.RefObject<HTMLElement>;
    children: React.ReactNode;
}

// A colour-halftone clipping mask, like Photoshop's Color Halftone used as a mask: the art
// shows only inside round dots on a 45° screen. Dot area follows tone (amplitude
// modulation), so dots grow from nothing in the bottom-left corner until they merge into
// the full image towards the top right. Outside the dots is the page itself.
const SPACING = 9;
const FULL_RADIUS = (SPACING / Math.SQRT2) * 1.04;
const GOLDEN = (1 + Math.sqrt(5)) / 2;
// The bottom-left page-coloured corner covers ~10% of the panel; tone then rises over
// φ^1.5 times its leg.
const CLEAR_AREA = 0.1;
const BAND_RATIO = Math.pow(GOLDEN, 1.5);
const MOBILE_BAND = 170;
const TEXT_GAP = 32;
// Near the copy, tone is held down along the same 45° axis (never by distance to its box,
// which drew a visible rectangle), so the screen stays one smooth diagonal gradient.
const COPY_FEATHER = 240;

const smoothstep = (x: number) => {
    const t = Math.min(Math.max(x, 0), 1);
    return t * t * (3 - 2 * t);
};

export function HalftoneMask({ containerRef, textRef, children }: HalftoneMaskProps) {
    const [mask, setMask] = useState<string | null>(null);
    const urlRef = useRef<string | null>(null);

    // A passive effect: refs on the parent panel and the sibling copy are only guaranteed
    // attached once the whole commit has finished.
    useEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;
        if (!container || !text) return;

        const build = () => {
            const box = container.getBoundingClientRect();
            const copy = text.getBoundingClientRect();
            const w = box.width;
            const h = box.height;
            // The copy's top-right corner, the point of it furthest along the 45° axis.
            const copyLeg = copy.right - box.left + (box.bottom - copy.top);
            const desktop = w >= 640;

            let tone: (x: number, y: number) => number;
            let fullFrom: string;
            if (desktop) {
                // Distance from the bottom-left corner along the 45° axis, in "leg" units.
                const clearLeg = Math.sqrt(2 * CLEAR_AREA * w * h);
                const band = clearLeg * BAND_RATIO;
                tone = (x, y) => (x + (h - y) - clearLeg) / band;
                // Beyond the band the screen is solid: one polygon instead of thousands of dots.
                const full = clearLeg + band + SPACING;
                fullFrom = `<polygon points="${full - h},0 ${w},0 ${w},${h} ${full},${h}"/>`;
            } else {
                const edge = copy.top - box.top - TEXT_GAP;
                tone = (_x, y) => (edge - y) / MOBILE_BAND;
                fullFrom = `<rect x="0" y="0" width="${w}" height="${Math.max(edge - MOBILE_BAND - SPACING, 0)}"/>`;
            }

            const dots: string[] = [];
            // Walk a grid rotated 45°: u runs along one diagonal, v along the other.
            const reach = w + h;
            for (let u = -reach; u <= reach; u += SPACING) {
                for (let v = 0; v <= reach; v += SPACING) {
                    const x = (u + v) / Math.SQRT2;
                    const y = (v - u) / Math.SQRT2;
                    if (x < -SPACING || x > w + SPACING || y < -SPACING || y > h + SPACING) continue;
                    let t = tone(x, y);
                    if (t <= 0 || t >= 1.05) continue;
                    if (desktop) t *= smoothstep((x + (h - y) - copyLeg + COPY_FEATHER * 0.65) / COPY_FEATHER);
                    // Dot area is proportional to tone, so the radius follows its square root.
                    const r = FULL_RADIUS * Math.sqrt(Math.min(t, 1));
                    if (r < 0.35) continue;
                    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"/>`);
                }
            }

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="#000">${fullFrom}${dots.join("")}</svg>`;
            const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
            urlRef.current = url;
            setMask(url);
        };

        build();
        const observer = new ResizeObserver(build);
        observer.observe(container);
        observer.observe(text);
        return () => {
            observer.disconnect();
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        };
    }, [containerRef, textRef]);

    // Until the mask is built, a soft diagonal fade keeps the copy readable.
    const style: React.CSSProperties = mask
        ? {
              maskImage: `url(${mask})`,
              WebkitMaskImage: `url(${mask})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
          }
        : {
              maskImage: "linear-gradient(45deg, transparent 35%, #000 70%)",
              WebkitMaskImage: "linear-gradient(45deg, transparent 35%, #000 70%)",
          };

    return (
        <div aria-hidden className="absolute inset-0 overflow-hidden" style={style}>
            {children}
        </div>
    );
}
