"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ProjectCard from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/api/portfolio";

interface Props {
  projects: Project[];
}

export default function Projects({ projects }: Props) {
  const t = useTranslations("projects");

  return (
    <section id="projects" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <AnimatedSection className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <motion.p variants={fadeInUp} className="font-mono text-xs tracking-[0.2em] text-accent">
              {t("label")}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
              {t("heading")}
            </motion.h2>
          </div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {projects.map((proj) => (
              <motion.div key={proj.id} variants={fadeInUp}>
                <ProjectCard
                  name={proj.title}
                  description={proj.description}
                  techs={proj.techs.map((t) => t.name)}
                  github={proj.githubUrl ?? ""}
                  live={proj.url}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
