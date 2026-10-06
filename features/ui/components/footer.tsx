import { Container } from "./container";

export function Footer() {
    return (
        <footer className="border-t border-line py-8">
            <Container className="flex flex-wrap justify-between gap-2 text-sm text-mute">
                <p>© {new Date().getFullYear()} Yusa Liu</p>
                <p>Thanks for reading.</p>
            </Container>
        </footer>
    );
}
