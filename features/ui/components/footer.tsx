import { Container } from "./container";

export function Footer() {
    return (
        <footer className="mt-24 border-t-2 border-dashed border-haze py-8">
            <Container className="flex flex-wrap justify-between gap-2 text-sm text-mute">
                <p>© {new Date().getFullYear()} Yusa Liu</p>
                <p>Thanks for playing.</p>
            </Container>
        </footer>
    );
}
