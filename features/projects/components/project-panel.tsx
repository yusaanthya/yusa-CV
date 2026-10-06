"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/features/ui/components/container";
import { ScrollLag } from "@/features/ui/components/scroll-lag";
import { TagList } from "@/features/ui/components/tag-list";
import { Project } from "../projects";
import { HalftoneMask } from "./halftone-mask";

interface ProjectPanelProps {
    project: Project;
}

export function ProjectPanel({ project }: ProjectPanelProps) {
    const ref = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const shouldReduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    // The key art drifts slower than the page. The overscan is kept small because every
    // extra percent enlarges the image and softens it on high-density screens.
    const y = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0%", "0%"] : ["-9%", "9%"]);

    return (
        <article
            ref={ref}
            aria-labelledby={`${project.slug}-title`}
            className="relative overflow-hidden sm:h-[min(84vh,46rem)] sm:min-h-[32rem]"
        >
            {/* The art is clipped by a colour-halftone mask fixed to the panel, so it
                parallaxes behind the dot screen; outside the dots is the page itself. */}
            <HalftoneMask containerRef={ref} textRef={textRef}>
                <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[12%]">
                    <Image
                        src={project.image}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                        style={{ objectPosition: project.imagePosition }}
                    />
                </motion.div>
            </HalftoneMask>

            {/* On phones the art shows above the copy instead of behind it. */}
            <Container className="relative flex h-full items-center pb-10 pt-72 sm:items-end sm:pb-14 sm:pt-0">
                <ScrollLag className="w-full max-w-lg">
                    <div ref={textRef}>
                        <p className="text-sm font-semibold tracking-wide text-ink">{project.org}</p>
                        <h3 id={`${project.slug}-title`} className="mt-2 font-display text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                            {project.title}
                        </h3>
                        <div aria-hidden className="rule mt-6 w-24 text-accent" />
                        <p className="mt-6 leading-relaxed text-ink">{project.summary}</p>
                        <TagList tags={project.tags} className="mt-5 [&>li]:border-ink/40 [&>li]:text-ink" />

                        <ScrollLag className="mt-8">
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-rollover">
                                Visit {project.linkLabel}
                                <ArrowUpRight aria-hidden className="h-4 w-4" />
                                <span className="sr-only">(opens in a new tab)</span>
                            </a>
                        </ScrollLag>
                    </div>
                </ScrollLag>
            </Container>
        </article>
    );
}
