"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, scaleIn, staggerContainer } from "@/lib/animations";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function About() {
  const t = useTranslations("about");

  const stats = [
    { value: "4+", label: t("stats.experience") },
    { value: "10+", label: t("stats.projects") },
    { value: "Abidjan", label: t("stats.location") },
  ];

  return (
    <section id="about" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px] lg:gap-20">
          {/* Contenu */}
          <AnimatedSection className="flex flex-col gap-8">
            <motion.p
              variants={fadeInUp}
              className="font-mono text-xs tracking-[0.2em] text-accent"
            >
              {t("label")}
            </motion.p>

            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl font-bold leading-tight text-text-primary sm:text-4xl lg:text-5xl"
            >
              {t("h2_1")}{" "}
              <span className="text-text-secondary">{t("h2_2")}</span>{" "}
              <span className="text-text-muted">{t("h2_3")}</span>
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              className="flex flex-col gap-5"
            >
              {(["p1", "p2", "p3"] as const).map((key, i) => (
                <motion.p
                  key={key}
                  variants={fadeInUp}
                  className={`max-w-xl font-mono leading-relaxed ${
                    i < 2
                      ? "text-base text-text-secondary"
                      : "text-sm text-text-muted"
                  }`}
                >
                  {t(key)}
                </motion.p>
              ))}
            </motion.div>
          </AnimatedSection>

          {/* Métriques */}
          <AnimatedSection className="flex flex-row gap-3 lg:flex-col lg:gap-4 lg:pt-20">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className="flex flex-1 flex-col border border-border bg-surface p-5 transition-colors duration-300 hover:border-accent lg:flex-none lg:p-6"
              >
                <p className="font-display text-2xl font-bold text-accent lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 font-mono text-xs text-text-secondary lg:mt-2 lg:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
