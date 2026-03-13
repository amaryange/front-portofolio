"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { Experience as ExperienceType } from "@/lib/api/portfolio";

interface ExperienceCardProps {
  role: string;
  company: string;
  period: string;
  points: string[];
}

function ExperienceCard({ role, company, period, points }: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty("--y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--x", "50%");
    card.style.setProperty("--y", "50%");
  };

  return (
    <div
      ref={cardRef}
      className="experience-card p-6"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="experience-shine" aria-hidden="true" />
      <time className="font-mono text-xs tracking-wider text-text-muted">{period}</time>
      <h3 className="mt-2 font-display text-lg font-bold text-text-primary">{role}</h3>
      <p className="mt-0.5 font-mono text-sm text-accent">{company}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {points.map((point, j) => (
          <li key={j} className="flex items-start gap-2.5 font-mono text-sm text-text-secondary">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Props {
  experiences: ExperienceType[];
}

export default function Experience({ experiences }: Props) {
  const t = useTranslations("experience");
  const locale = useLocale();

  const formatPeriod = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate).getFullYear();
    const end = endDate ? new Date(endDate).getFullYear() : t("presentLabel");
    return `${start} — ${end}`;
  };

  return (
    <section id="experience" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <AnimatedSection className="mb-16 flex flex-col gap-6">
          <motion.p variants={fadeInUp} className="font-mono text-xs tracking-[0.2em] text-accent">
            {t("label")}
          </motion.p>
          <motion.h2 variants={fadeInUp} className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
            {t("heading")}
          </motion.h2>
        </AnimatedSection>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-border lg:hidden" />
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block" />

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col"
          >
            {experiences.map((exp, i) => {
              const isRight = i % 2 !== 0;
              return (
                <motion.div
                  key={exp.id}
                  variants={fadeInUp}
                  className="relative mb-10 pl-12 last:mb-0 lg:grid lg:grid-cols-2 lg:pl-0"
                >
                  <div className="absolute left-4 top-[22px] z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-accent bg-bg lg:hidden" />
                  <div className="absolute left-1/2 top-[22px] z-10 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-bg lg:block" />
                  <div className={isRight ? "lg:col-start-2 lg:pl-14" : "lg:col-start-1 lg:pr-14"}>
                    <ExperienceCard
                      role={exp.position}
                      company={exp.company}
                      period={formatPeriod(exp.startDate, exp.endDate)}
                      points={exp.points.map((p) => p.content)}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
