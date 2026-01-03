import Link from "next/link";
import { Container } from "./container";

const NAV_ITEMS = [
    { label: "About", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Portfolio", href: "/portfolio" },
];

export function Header() {
    return (
        <header className="py-8 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
            <Container className="flex items-center justify-between">
                <Link href="/" className="font-bold text-xl tracking-tight">
                    Yusa Liu
                </Link>
                <nav className="flex gap-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </Container>
        </header>
    );
}
