"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/features/ui/components/container";
import { ScrollLag } from "@/features/ui/components/scroll-lag";
import { TagList } from "@/features/ui/components/tag-list";
import { Project } from "../projects";

interface ProjectPanelProps {
    project: Project;
}

export function ProjectPanel({ project }: ProjectPanelProps) {
    const ref = useRef<HTMLElement>(null);
    const shouldReduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    // The key art drifts slower than the page; it stays put under reduced motion.
    const y = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0%", "0%"] : ["-16%", "16%"]);
    const { tint } = project;

    return (
        <article
            ref={ref}
            aria-labelledby={`${project.slug}-title`}
            className="relative overflow-hidden sm:h-[min(84vh,46rem)] sm:min-h-[32rem]"
        >
            <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[20%]">
                <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover"
                    style={{ objectPosition: project.imagePosition }}
                />
            </motion.div>
            {/* A brand-coloured multiply wash instead of a grey scrim: it mutes the key art's
                own lettering behind the panel while keeping the colour saturated. */}
            <div
                aria-hidden
                className="absolute inset-0 mix-blend-multiply"
                style={{
                    background: `linear-gradient(to right, ${tint} 0%, ${tint}cc 24%, transparent 62%), linear-gradient(to top, ${tint}b3 0%, transparent 48%)`,
                }}
            />

            {/* On phones the art shows above the panel instead of being covered by it. */}
            <Container className="relative flex h-full items-end pb-8 pt-64 sm:pb-14 sm:pt-0">
                <ScrollLag className="w-full max-w-xl">
                    <div className="border border-line bg-paper/90 p-6 backdrop-blur-md sm:p-8">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-mute">
                            <span className="font-semibold tracking-wide text-ink">{project.org}</span>
                            <span>{project.period}</span>
                        </div>
                        <h3 id={`${project.slug}-title`} className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
                            {project.title}
                        </h3>
                        <p className="pt-4 leading-relaxed text-mute">{project.summary}</p>
                        <TagList tags={project.tags} className="mt-4" />

                        <ScrollLag className="mt-6">
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
