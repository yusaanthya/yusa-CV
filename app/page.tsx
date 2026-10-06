import Link from "next/link";
import { Container } from "@/features/ui/components/container";

const MENU = [
  { label: "Read the CV", href: "/cv" },
  { label: "Browse the blog", href: "/blog" },
  { label: "View portfolio", href: "/portfolio" },
];

export default function Home() {
  return (
    <section className="halftone relative overflow-hidden border-b-2 border-ink/10">
      <Container className="relative py-20 sm:py-28">
        {/* The name always sits on the marker slab so it reads in both themes. */}
        <div className="relative inline-block px-4 py-3 sm:px-6">
          <div
            aria-hidden
            className="intro-slab absolute inset-0 -skew-x-12 bg-marker"
          />
          <h1
            className="intro-rise relative font-display leading-[0.9] text-on-accent [text-shadow:0.06em_0.06em_0_rgb(var(--pop))]"
            style={{ fontSize: "clamp(4.5rem, 17vw, 10rem)" }}
          >
            Yusa
            <br />
            Liu
          </h1>
        </div>

        <p
          className="intro-rise relative mt-6 w-fit -rotate-3 rounded-full bg-ink px-4 py-1.5 text-sm text-paper"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          Backend engineer, trained as a game designer
        </p>

        <p
          className="intro-rise relative mt-8 max-w-xl text-lg leading-relaxed text-mute"
          style={{ "--d": "200ms" } as React.CSSProperties}
        >
          I build event-driven backend systems for fintech and games, with
          clear boundaries and failures you can see and recover from. Before
          that, I studied game design in London and shipped an indie prototype
          at EGX Rezzed.
        </p>

        <nav aria-label="Start" className="relative mt-12">
          <ul className="flex flex-col items-start gap-1">
            {MENU.map((item, index) => (
              <li
                key={item.href}
                className="intro-rise"
                style={{ "--d": `${300 + index * 70}ms` } as React.CSSProperties}
              >
                <Link
                  href={item.href}
                  className="menu-cursor group inline-flex min-h-14 items-center gap-3 pr-2 font-display text-2xl sm:text-3xl"
                >
                  <span
                    aria-hidden
                    className="text-pop opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    ▶
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
