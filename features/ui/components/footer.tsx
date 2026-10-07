import { Container } from "./container";
import { SOCIAL_LINKS } from "../social-links";

export function Footer() {
    return (
        <footer className="border-t border-line py-8">
            <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-mute">
                <p>© {new Date().getFullYear()} Yusa Liu</p>
                {/* -mx-2 offsets the links' padding so their text lines up with the copyright. */}
                <ul className="-mx-2 flex flex-wrap items-center gap-x-1">
                    {SOCIAL_LINKS.map((link) => (
                        <li key={link.label}>
                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center px-2 transition-colors duration-150 hover:text-accent"
                            >
                                {link.label}
                                <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </Container>
        </footer>
    );
}
