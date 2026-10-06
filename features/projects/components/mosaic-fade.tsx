"use client";

import { useEffect, useRef, useState } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";

interface MosaicFadeProps {
    containerRef: React.RefObject<HTMLElement>;
    textRef: React.RefObject<HTMLElement>;
    // The parallaxing layer the key art is drawn in, and the art itself.
    layerRef: React.RefObject<HTMLElement>;
    imageSrc: string;
    imagePosition: string;
    parallax: MotionValue<string>;
}

// Equal round tiles on a hexagonal grid. Each tile takes the average colour of the art
// beneath it, so the art itself turns into a mosaic; tone fades by tile density only.
const SPACING = 12;
const ROW_SPACING = (SPACING * Math.sqrt(3)) / 2;
const RADIUS = SPACING * 0.5;
// Hexagonal cell that tiles the grid exactly; the page colour is laid cell by cell so the
// mosaic's edge is stepped like real tiles rather than a smooth cut.
const HEX_R = SPACING / Math.sqrt(3) + 0.5;
const TEXT_GAP = 32;
// Desktop: tiles are dense at the curve and thin out over this depth.
const FADE_DEPTH = 240;
const MOBILE_FADE = 160;
// Tiles thin out to none around the copy, so it always sits on the plain page colour.
const COPY_FEATHER = 60;
// Room for dense tiles between the curve and the title.
const HEADROOM = 90;

// The mosaic's top edge as fractions of the panel (sketched by the owner): rises slightly
// from the left edge, passes above the title, then sweeps down to the bottom right.
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

// 8×8 Bayer thresholds give an even, ordered thinning instead of random clumps.
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

function parsePosition(position: string): [number, number] {
    const parts = position.split(/\s+/).map((p) => (p === "center" ? 0.5 : parseFloat(p) / 100));
    return [parts[0] ?? 0.5, parts[1] ?? 0.5];
}

interface Layout {
    width: number;
    height: number;
    cells: Path2D;
    tiles: { x: number; y: number }[];
}

export function MosaicFade({ containerRef, textRef, layerRef, imageSrc, imagePosition, parallax }: MosaicFadeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const layout = useRef<Layout | null>(null);
    // Average colour per tile cell across the art layer, sampled once per size.
    const colours = useRef<{ data: Uint8ClampedArray; cols: number; rows: number } | null>(null);
    const frame = useRef(0);
    const [ready, setReady] = useState(false);

    const draw = () => {
        frame.current = 0;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const layer = layerRef.current;
        const l = layout.current;
        const c = colours.current;
        if (!canvas || !container || !layer || !l || !c) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const offsetTop = layer.getBoundingClientRect().top - container.getBoundingClientRect().top;
        const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();

        ctx.clearRect(0, 0, l.width, l.height);
        ctx.fillStyle = `rgb(${paper.replace(/\s+/g, ",")})`;
        ctx.fill(l.cells);
        for (const { x, y } of l.tiles) {
            const col = Math.min(c.cols - 1, Math.max(0, Math.floor(x / SPACING)));
            const row = Math.min(c.rows - 1, Math.max(0, Math.floor((y - offsetTop) / ROW_SPACING)));
            const i = (row * c.cols + col) * 4;
            ctx.fillStyle = `rgb(${c.data[i]},${c.data[i + 1]},${c.data[i + 2]})`;
            ctx.beginPath();
            ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const schedule = () => {
        if (!frame.current) frame.current = requestAnimationFrame(draw);
    };

    useMotionValueEvent(parallax, "change", schedule);

    useEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;
        const layer = layerRef.current;
        const canvas = canvasRef.current;
        if (!container || !text || !layer || !canvas) return;

        const image = new Image();
        image.src = imageSrc;
        const [px, py] = parsePosition(imagePosition);

        const sample = () => {
            if (!image.complete || !image.naturalWidth) return;
            const lw = layer.offsetWidth;
            const lh = layer.offsetHeight;
            const cols = Math.ceil(lw / SPACING) + 1;
            const rows = Math.ceil(lh / ROW_SPACING) + 1;
            // Reproduce object-fit: cover at tile resolution; downscaling averages each cell.
            const scale = Math.max(lw / image.naturalWidth, lh / image.naturalHeight);
            const dw = image.naturalWidth * scale;
            const dh = image.naturalHeight * scale;
            const dx = (lw - dw) * px;
            const dy = (lh - dh) * py;
            const off = document.createElement("canvas");
            off.width = cols;
            off.height = rows;
            const octx = off.getContext("2d");
            if (!octx) return;
            octx.imageSmoothingQuality = "high";
            octx.drawImage(image, dx / SPACING, dy / ROW_SPACING, dw / SPACING, dh / ROW_SPACING);
            colours.current = { data: octx.getImageData(0, 0, cols, rows).data, cols, rows };
        };

        const measure = () => {
            const box = container.getBoundingClientRect();
            const copy = text.getBoundingClientRect();
            const width = box.width;
            const height = box.height;
            const copyBox = {
                left: copy.left - box.left,
                top: copy.top - box.top,
                right: copy.right - box.left,
                bottom: copy.bottom - box.top,
            };

            let edgeY: (x: number) => number;
            let fade: number;
            if (width >= 640) {
                // Keep the sketched shape, but anchor its left part just above the title.
                const lift = copyBox.top - TEXT_GAP - HEADROOM - curveY(copyBox.left / width) * height;
                edgeY = (x) => curveY(x / width) * height + lift * (1 - x / width);
                fade = FADE_DEPTH;
            } else {
                // Phones: the copy spans the full width, so the mosaic sits in a band above it.
                edgeY = () => copyBox.top - TEXT_GAP - MOBILE_FADE;
                fade = MOBILE_FADE;
            }

            const cells = new Path2D();
            const tiles: { x: number; y: number }[] = [];
            for (let row = 0; row * ROW_SPACING < height + SPACING; row++) {
                const y = row * ROW_SPACING;
                const shift = row % 2 ? SPACING / 2 : 0;
                for (let col = 0; col * SPACING < width + SPACING; col++) {
                    const x = col * SPACING + shift;
                    const depth = y - edgeY(Math.min(x, width));
                    if (depth < 0) continue;
                    for (let k = 0; k < 6; k++) {
                        const a = Math.PI / 6 + (k * Math.PI) / 3;
                        const px = x + HEX_R * Math.cos(a);
                        const py = y + HEX_R * Math.sin(a);
                        if (k === 0) cells.moveTo(px, py);
                        else cells.lineTo(px, py);
                    }
                    cells.closePath();
                    const dx = Math.max(copyBox.left - x, 0, x - copyBox.right);
                    const dy = Math.max(copyBox.top - y, 0, y - copyBox.bottom);
                    const density = (1 - smoothstep(depth / fade)) * smoothstep(Math.hypot(dx, dy) / COPY_FEATHER);
                    if (density > threshold(row, col)) tiles.push({ x, y });
                }
            }

            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
            layout.current = { width, height, cells, tiles };
            sample();
            draw();
            if (colours.current) setReady(true);
        };

        image.onload = measure;
        if (image.complete) measure();
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        observer.observe(text);

        // Redraw in the new page colour when the appearance changes.
        const themeObserver = new MutationObserver(schedule);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        const scheme = window.matchMedia("(prefers-color-scheme: dark)");
        scheme.addEventListener("change", schedule);

        return () => {
            observer.disconnect();
            themeObserver.disconnect();
            scheme.removeEventListener("change", schedule);
            if (frame.current) cancelAnimationFrame(frame.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef, textRef, layerRef, imageSrc, imagePosition]);

    return (
        <>
            {!ready && (
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--paper))_55%,transparent_75%)] sm:bg-[linear-gradient(45deg,rgb(var(--paper))_40%,transparent_70%)]"
                />
            )}
            <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />
        </>
    );
}
