"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { label: "CV", href: "/cv" },
    { label: "Blog", href: "/blog" },
    { label: "Portfolio", href: "/portfolio" },
];

export function NavLinks() {
    const pathname = usePathname();

    return (
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-3">
            {NAV_ITEMS.map((item) => {
                const isCurrent = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isCurrent ? "page" : undefined}
                        className="menu-cursor inline-flex min-h-11 items-center px-3 font-display text-[0.95rem] text-ink"
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
