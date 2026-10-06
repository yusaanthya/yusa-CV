"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "CV", href: "/cv" },
    { label: "Blog", href: "/blog" },
    { label: "Portfolio", href: "/portfolio" },
];

export function NavLinks() {
    const pathname = usePathname();

    return (
        <nav aria-label="Main">
            <ul className="flex items-center divide-x divide-line">
                {NAV_ITEMS.map((item) => {
                    const isCurrent = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={isCurrent ? "page" : undefined}
                                className={cn(
                                    "inline-flex min-h-11 items-center px-3 text-[0.95rem] sm:px-5",
                                    "underline-offset-[10px] decoration-accent decoration-2 hover:underline",
                                    isCurrent ? "font-semibold underline" : "text-mute hover:text-ink"
                                )}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
