import Link from "next/link";
import { Container } from "@/features/ui/components/container";

export default function Home() {
  return (
    <Container className="py-32">
      <section className="max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          Hi, I'm Yusa Liu.
          <br />
          <span className="text-muted-foreground">Backend Engineer.</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-10">
          I build robust, scalable backend systems.
          Focusing on strict boundaries, clean architecture, and performance.
        </p>

        <div className="flex gap-4">
          <Link
            href="/blog"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Read Blog
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-neutral-100 hover:text-accent-foreground"
          >
            View Portfolio
          </Link>
        </div>
      </section>
    </Container>
  );
}
