"use client";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity print:hidden"
        >
            Download PDF
        </button>
    );
}
