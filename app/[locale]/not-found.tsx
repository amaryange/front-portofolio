"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

const container: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const bigNumber: Variants = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">

      {/* Grille d'arrière-plan */}
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* Halo central */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        variants={container}
        initial="initial"
        animate="animate"
      >
        {/* 404 */}
        <motion.div variants={bigNumber} className="select-none">
          <span
            className="glitch-404 gradient-text font-display font-bold leading-none tracking-tight"
            style={{ fontSize: "clamp(7rem,22vw,16rem)" }}
            data-text="404"
          >
            404
          </span>
        </motion.div>

        {/* Label terminal */}
        <motion.p
          variants={item}
          className="-mt-2 mb-6 font-mono text-xs tracking-[0.25em] text-text-muted"
        >
          {t("label")}
          <span className="terminal-cursor" />
        </motion.p>

        {/* Séparateur */}
        <motion.div
          variants={item}
          className="mb-6 h-px w-16 bg-border"
        />

        {/* Heading */}
        <motion.h1
          variants={item}
          className="mb-4 font-display text-2xl font-bold text-text-primary sm:text-3xl"
        >
          {t("heading")}
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={item}
          className="mb-10 max-w-sm font-mono text-sm leading-relaxed text-text-secondary"
        >
          {t("description")}
        </motion.p>

        {/* CTA */}
        <motion.div variants={item}>
          <Link
            href={`/${locale}`}
            className="group inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 font-mono text-sm text-text-secondary transition-all duration-200 hover:border-accent/50 hover:text-accent hover:shadow-[0_0_20px_rgba(0,212,170,0.08)]"
          >
            <motion.span
              className="inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: -3 }}
              transition={{ duration: 0.15 }}
            >
              ←
            </motion.span>
            {t("cta")}
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
