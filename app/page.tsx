import Link from "next/link";
import { Container } from "@/features/ui/components/container";
import { AnimateIn } from "@/features/ui/components/animate-in";

export default function Home() {
  return (
    <Container className="py-32">
      <section className="max-w-2xl">
        <AnimateIn variant="fade-up">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Hi, I'm Yusa Liu.
            <br />
            <span className="text-muted-foreground">Backend Engineer.</span>
          </h1>
        </AnimateIn>

        <AnimateIn variant="fade-up" delay={0.1}>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10">
            I build robust, scalable backend systems.
            Focusing on strict boundaries, clean architecture, and performance.
          </p>
        </AnimateIn>

        <AnimateIn variant="fade-up" delay={0.2}>
          <div className="flex gap-4">
            <Link
              href="/blog"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Read Blog
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex h-10 items-center justify-center rounded-md border border-brand text-brand px-8 text-sm font-medium shadow-sm transition-colors hover:bg-brand hover:text-white"
            >
              View Portfolio
            </Link>
          </div>
        </AnimateIn>
      </section>
    </Container>
  );
}
