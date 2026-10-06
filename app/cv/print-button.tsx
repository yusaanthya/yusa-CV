"use client";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center rounded-[10px] border-2 border-ink bg-marker px-5 font-display text-sm text-on-accent shadow-[3px_3px_0_rgb(var(--ink))] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none print:hidden"
        >
            Print or save as PDF
        </button>
    );
}
