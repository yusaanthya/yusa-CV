"use client";

export function PrintButton() {
    return (
        <button onClick={() => window.print()} className="btn btn-secondary print:hidden">
            Print or save as PDF
        </button>
    );
}
