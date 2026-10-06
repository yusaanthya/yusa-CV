import Image from "next/image";
import Link from "next/link";
import { Container } from "@/features/ui/components/container";

export default function Home() {
  return (
    <Container className="grid items-center gap-10 py-12 md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:py-24">
      <div className="intro-fade order-2 md:order-1" style={{ "--d": "120ms" } as React.CSSProperties}>
        <h1
          className="font-serif leading-[0.95] tracking-[-0.025em]"
          style={{ fontSize: "clamp(3.5rem, 9vw, 6.25rem)" }}
        >
          Yusa Liu
        </h1>
        <p lang="zh-Hant" className="mt-3 font-serif text-2xl text-mute">
          劉于莎
        </p>

        <div aria-hidden className="rule mt-8 w-40 text-accent" />

        <p className="mt-8 text-xl font-medium">
          Backend engineer, trained as a game designer.
        </p>
        <p className="mt-3 max-w-[34rem] leading-relaxed text-mute">
          I build event-driven backend systems for fintech and games, with
          clear boundaries and failures you can see and recover from. Before
          that, I studied game design in London and shipped an indie prototype
          at EGX Rezzed.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/cv" className="btn btn-primary">
            Read the CV
          </Link>
          <Link href="/blog" className="btn btn-secondary">
            Browse the blog
          </Link>
          <Link href="/portfolio" className="btn btn-secondary">
            View portfolio
          </Link>
        </div>
      </div>

      {/* The portrait rises out of a hairline circle, borrowed from the e-book shelf frame. */}
      <div className="intro-fade relative order-1 mx-auto w-full max-w-[15rem] sm:max-w-[19rem] md:order-2 md:max-w-[25rem]">
        <div
          aria-hidden
          className="absolute inset-x-[3%] bottom-[2%] aspect-square rounded-full border border-ink"
        />
        <div
          aria-hidden
          className="absolute bottom-[2%] left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-accent"
        />
        <Image
          src="/images/portrait.png"
          alt="Illustrated self-portrait of Yusa in a red skirt, holding a drawing tablet and a stylus"
          width={700}
          height={768}
          priority
          className="relative h-auto w-full"
          style={{
            // Above the circle's centre the figure breaks out; below it, the circle crops her.
            // Circle: 94% of width, centred at 55.2% of the 700x768 image height.
            mask:
              "linear-gradient(#000 0 0) top / 100% 55.2% no-repeat, radial-gradient(ellipse 47% 42.85% at 50% 55.2%, #000 99.5%, transparent 100%)",
            WebkitMask:
              "linear-gradient(#000 0 0) top / 100% 55.2% no-repeat, radial-gradient(ellipse 47% 42.85% at 50% 55.2%, #000 99.5%, transparent 100%)",
          }}
        />
      </div>
    </Container>
  );
}
