"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  siSpringboot,
  siKubernetes,
  siReact,
  siNextdotjs,
  siDocker,
  siAdonisjs,
  siGrafana,
  siOpentelemetry,
} from "simple-icons";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const techBadges = [
  { name: "Spring Boot", delay: "0s",    icon: siSpringboot },
  { name: "Kubernetes",  delay: "0.5s",  icon: siKubernetes },
  { name: "React Native",delay: "1s",    icon: siReact },
  { name: "Next.js",     delay: "0.25s", icon: siNextdotjs },
  { name: "Docker",      delay: "0.75s", icon: siDocker },
  { name: "AdonisJS",    delay: "1.25s", icon: siAdonisjs },
  { name: "Grafana",     delay: "0.4s",  icon: siGrafana },
  { name: "OpenTelemetry", delay: "0.9s", icon: siOpentelemetry },
];

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden">
      <div
        className="hero-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      {/* Tracés lumineux sur la grille 64px — évitent la zone du titre */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="dot-glow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/*
          Chemin 1 : droite → descend → gauche → bas (x ≥ 832 pour y < 640)
          Longueur = 1960 px — dashoffset : from 60 to -(1960-60)=-1900
          <animate> + <animateMotion> sur la même horloge SMIL → sync parfaite
        */}
        <path
          id="tp1"
          className="hero-trace-1"
          d="M 1600 192 H 832 V 640 H 448 V 1000"
          fill="none"
          stroke="#00d4aa"
          strokeWidth="1"
          strokeLinecap="square"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="60"
            to="-1900"
            dur="10s"
            repeatCount="indefinite"
            begin="-4s"
          />
        </path>
        <circle r="3.5" fill="#00d4aa" filter="url(#dot-glow)">
          <animateMotion dur="10s" repeatCount="indefinite" begin="-4s">
            <mpath href="#tp1" />
          </animateMotion>
          <animate attributeName="r" values="3;5.5;3.5;5;3" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.65;1;0.75;1" dur="1.2s" repeatCount="indefinite" />
        </circle>

        {/*
          Chemin 2 : bas → monte → gauche → monte → droite (x ≥ 768 pour y < 512)
          Longueur = 1960 px — même mécanique
        */}
        <path
          id="tp2"
          className="hero-trace-2"
          d="M 1024 1000 V 384 H 768 V 128 H 1600"
          fill="none"
          stroke="#00d4aa"
          strokeWidth="1"
          strokeLinecap="square"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="60"
            to="-1900"
            dur="13s"
            repeatCount="indefinite"
            begin="-1.5s"
          />
        </path>
        <circle r="3.5" fill="#00d4aa" filter="url(#dot-glow)">
          <animateMotion dur="13s" repeatCount="indefinite" begin="-1.5s">
            <mpath href="#tp2" />
          </animateMotion>
          <animate attributeName="r" values="3;5.5;3.5;5;3" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.65;1;0.75;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 pt-28 md:px-8 lg:pt-36">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex max-w-2xl flex-col gap-6"
        >
          <motion.div variants={fadeInUp}>
            <h1 className="font-display text-5xl font-bold leading-none tracking-tight text-text-primary sm:text-6xl lg:text-8xl">
              M. Amary
              <span className="terminal-cursor" aria-hidden="true" />
            </h1>
          </motion.div>

          <motion.div variants={fadeInUp} className="h-px w-16 bg-accent" />

          <motion.p
            variants={fadeInUp}
            className="gradient-text font-display text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl"
          >
            {t("role")}
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="max-w-lg font-mono text-base leading-relaxed text-text-secondary"
          >
            {t("pitch")}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-3 pt-2 sm:flex-row"
          >
            <a
              href="#projects"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 font-mono text-sm font-medium text-bg transition-all duration-150 hover:brightness-110 active:scale-95"
            >
              {t("ctaProjects")}
            </a>
            <a
              href="/cv.pdf"
              download
              className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 font-mono text-sm font-medium text-text-secondary transition-all duration-150 hover:border-accent hover:text-text-primary active:scale-95"
            >
              {t("ctaCV")}
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-2 pt-6"
          >
            {techBadges.map((tech) => (
              <span
                key={tech.name}
                className="tech-badge"
                style={{ animationDelay: tech.delay }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="mr-1.5 h-3 w-3 shrink-0 fill-current opacity-70"
                  aria-hidden
                >
                  <path d={tech.icon.path} />
                </svg>
                {tech.name}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
