"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/features/ui/components/container";
import { TagList } from "@/features/ui/components/tag-list";
import { Project } from "../projects";

interface ProjectPanelProps {
    project: Project;
}

export function ProjectPanel({ project }: ProjectPanelProps) {
    const ref = useRef<HTMLAnchorElement>(null);
    const shouldReduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    // The background drifts slower than the page; it stays put under reduced motion.
    const y = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0%", "0%"] : ["-10%", "10%"]);

    return (
        <a
            ref={ref}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-panel group relative block overflow-hidden focus-visible:outline-offset-[-6px] sm:h-[min(80vh,44rem)] sm:min-h-[30rem]"
        >
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
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            {/* Mutes the key art's own lettering behind the text panel. */}
            <div aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgb(0_0_0/0.78)_0%,rgb(0_0_0/0.5)_20%,transparent_58%)] sm:block" />

            {/* On phones the art shows above the panel instead of being covered by it. */}
            <Container className="relative flex h-full items-end pb-8 pt-64 sm:pb-12 sm:pt-0">
                <div className="w-full max-w-xl border border-line bg-paper/90 p-6 backdrop-blur-md sm:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-mute">
                        <span className="font-semibold tracking-wide text-ink">{project.org}</span>
                        <span>{project.period}</span>
                    </div>
                    <h3 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{project.title}</h3>

                    {/* Revealed on hover where hover exists; always shown on touch screens. */}
                    <div className="project-detail">
                        <div>
                            <p className="pt-4 leading-relaxed text-mute">{project.summary}</p>
                            <TagList tags={project.tags} className="mt-4" />
                        </div>
                    </div>

                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                        Visit {project.linkLabel}
                        <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span className="sr-only">(opens in a new tab)</span>
                    </span>
                </div>
            </Container>
        </a>
    );
}
