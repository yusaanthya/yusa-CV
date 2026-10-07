import Image from "next/image";
import { Container } from "@/features/ui/components/container";
import { ProjectPanel } from "@/features/projects/components/project-panel";
import { ScrollLag } from "@/features/ui/components/scroll-lag";
import { OTHER_WORK, PROJECTS } from "@/features/projects/projects";
import { OtherWorkList } from "@/features/projects/components/other-work-list";
import { assetPath } from "@/lib/utils";

export default function Home() {
  return (
    <>
      {/* Title-screen hero: an outlined name fills the left side like a backdrop and the
          portrait overlaps it from the right. Separate grid items so the name can sit on its
          own slow scroll layer behind the portrait. */}
      <Container className="relative grid min-h-[calc(100svh-4rem)] content-center py-10 md:grid-cols-[1.25fr_0.75fr] md:grid-rows-[auto_auto] md:py-16">
        <div className="intro-fade relative z-0 -mt-10 md:col-start-1 md:row-start-1 md:mt-0">
          <ScrollLag layer={0.5}>
            <h1
              className="hero-name font-display leading-[0.82] tracking-[-0.055em]"
              style={{ fontSize: "clamp(6.5rem, 30vw, 15rem)" }}
            >
              <span className="block">Yusa</span>
              <span className="block">Liu</span>
            </h1>
          </ScrollLag>
        </div>

        {/* The portrait rises out of a hairline circle, borrowed from the e-book shelf frame. */}
        <div
          className="intro-fade relative z-10 order-first ml-auto w-[52%] max-w-[16rem] sm:max-w-[19rem] md:order-none md:col-start-2 md:row-span-2 md:row-start-1 md:-ml-24 md:w-auto md:max-w-[26rem] md:self-center"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {/* Circle and figure move as one so the mask stays aligned with the hairline. */}
          <ScrollLag layer={2} className="relative">
            <div
              aria-hidden
              className="absolute inset-x-[3%] bottom-[2%] aspect-square rounded-full border border-ink"
            />
            <div
              aria-hidden
              className="absolute bottom-[2%] left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-accent"
            />
            <Image
              src={assetPath("/images/portrait.png")}
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
          </ScrollLag>
        </div>

        {/* Intro shares the portrait's scroll layer so the two move as one group. */}
        <div
          className="intro-fade relative z-20 mt-6 md:col-start-1 md:row-start-2 md:mt-8"
          style={{ "--d": "220ms" } as React.CSSProperties}
        >
          <ScrollLag layer={2}>
            <div aria-hidden className="rule w-40 text-accent" />
            <p className="mt-8 text-xl font-medium">Backend engineer, trained as a game designer.</p>
            <p className="mt-3 max-w-[34rem] leading-relaxed text-mute">
              I build event-driven backend systems for fintech and games, with
              clear boundaries and failures you can see and recover from. Before
              that, I studied game design in London and shipped an indie prototype
              at EGX Rezzed.
            </p>
          </ScrollLag>
        </div>
      </Container>

      <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-16 pb-4 pt-8">
        <Container className="pb-10">
          {/* Same slow layer as the hero name: headings anchor the scroll, content moves more. */}
          <ScrollLag layer={0.5}>
            <h2 id="projects-heading" className="font-display text-4xl tracking-[-0.04em]">
              Projects
            </h2>
            <div aria-hidden className="rule mt-5 text-ink" />
          </ScrollLag>
        </Container>
        <div className="flex flex-col gap-1">
          {PROJECTS.map((project) => (
            <ProjectPanel key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section aria-labelledby="other-work-heading" className="pb-8 pt-6">
        <Container>
          {/* No visible heading by design; screen readers still get a named section. */}
          <h2 id="other-work-heading" className="sr-only">
            Side projects and earlier work
          </h2>
          <OtherWorkList items={OTHER_WORK} />
        </Container>
      </section>
    </>
  );
}
