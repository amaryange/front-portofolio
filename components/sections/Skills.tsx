"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  siSpringboot,
  siAdonisjs,
  siPostgresql,
  siRedis,
  siReact,
  siExpo,
  siNextdotjs,
  siTypescript,
  siTailwindcss,
  siDocker,
  siKubernetes,
  siOpentelemetry,
  siGrafana,
} from "simple-icons";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { SkillGroup } from "@/lib/api/portfolio";

type SimpleIcon = { path: string; hex: string };

const ICON_MAP: Record<string, SimpleIcon> = {
  "Spring Boot":    siSpringboot,
  "AdonisJS":       siAdonisjs,
  "PostgreSQL":     siPostgresql,
  "Redis":          siRedis,
  "React Native":   siReact,
  "React":          siReact,
  "Expo":           siExpo,
  "Next.js":        siNextdotjs,
  "TypeScript":     siTypescript,
  "Tailwind CSS":   siTailwindcss,
  "Docker":         siDocker,
  "Kubernetes":     siKubernetes,
  "OpenTelemetry":  siOpentelemetry,
  "Grafana":        siGrafana,
};

function SkillBadge({ name }: { name: string }) {
  const icon = ICON_MAP[name];
  return (
    <span className="inline-flex cursor-default items-center gap-2 border border-border bg-surface px-4 py-2 font-mono text-sm text-text-secondary transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_18px_rgba(0,212,170,0.1)]">
      {icon && (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current opacity-60" aria-hidden>
          <path d={icon.path} />
        </svg>
      )}
      {name}
    </span>
  );
}

interface Props {
  skillGroups: SkillGroup[];
}

export default function Skills({ skillGroups }: Props) {
  const t = useTranslations("skills");

  return (
    <section id="skills" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <AnimatedSection className="flex flex-col gap-16">
          <div className="flex flex-col gap-6">
            <motion.p variants={fadeInUp} className="font-mono text-xs tracking-[0.2em] text-accent">
              {t("label")}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
              {t("heading")}
            </motion.h2>
          </div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-12 sm:grid-cols-2">
            {skillGroups.map((group) => (
              <motion.div key={group.id} variants={fadeInUp} className="flex flex-col gap-4">
                <h3 className="font-mono text-xs tracking-[0.2em] text-text-muted">
                  {group.name.toUpperCase()}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <SkillBadge key={skill.id} name={skill.name} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
