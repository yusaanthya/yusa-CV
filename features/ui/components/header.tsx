import Link from "next/link";
import { Container } from "./container";
import { NavLinks } from "./nav-links";

export function Header() {
    return (
        <header className="sticky top-0 z-50 border-b-2 border-ink/10 bg-paper/85 backdrop-blur-md">
            <Container className="flex h-16 items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex min-h-11 items-center gap-2 font-display text-lg"
                >
                    <span
                        aria-hidden
                        className="grid h-8 w-8 -rotate-6 place-items-center rounded-full bg-pop text-sm text-on-accent"
                    >
                        Y
                    </span>
                    <span className="sr-only sm:not-sr-only">Yusa Liu</span>
                </Link>
                <NavLinks />
            </Container>
        </header>
    );
}
