import Link from "next/link";
import { Container } from "./container";
import { NavLinks } from "./nav-links";

export function Header() {
    return (
        <header className="site-header sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-xl backdrop-saturate-150">
            <Container className="flex h-16 items-center justify-between">
                <Link href="/" className="inline-flex min-h-11 items-center gap-3">
                    <span
                        aria-hidden
                        className="grid h-9 w-9 place-items-center border border-ink font-serif text-lg leading-none"
                    >
                        YL
                    </span>
                    <span className="sr-only font-serif text-xl sm:not-sr-only">Yusa Liu</span>
                </Link>
                <NavLinks />
            </Container>
        </header>
    );
}
