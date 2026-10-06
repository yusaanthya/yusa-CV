import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

// next/image does not prefix basePath onto string sources, so files from public/ need it
// added by hand. The Pages deploy sets NEXT_PUBLIC_BASE_PATH (e.g. "/yusa-CV"); locally it is empty.
export function assetPath(path: string) {
    return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
