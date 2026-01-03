import { Container } from "./container";

export function Footer() {
    return (
        <footer className="py-8 mt-20 border-t border-border/40">
            <Container>
                <p className="text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Yusa Liu. Built with Next.js & Static MVC.
                </p>
            </Container>
        </footer>
    );
}
