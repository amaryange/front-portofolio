"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface ProjectCardProps {
  name: string;
  description: string;
  techs: string[];
  github: string | null;
  live?: string | null;
}

export default function ProjectCard({
  name,
  description,
  techs,
  github,
  live,
}: ProjectCardProps) {
  const t = useTranslations("projects");
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex h-full flex-col border border-border bg-surface p-6 transition-colors duration-300 hover:border-accent"
    >
      {/* Nom */}
      <h3 className="font-display text-lg font-bold text-text-primary">
        {name}
      </h3>

      {/* Description */}
      <p className="mt-2 font-mono text-sm leading-relaxed text-text-secondary">
        {description}
      </p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tags techs */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {techs.map((tech) => (
          <span
            key={tech}
            className="border border-border px-2 py-0.5 font-mono text-xs text-text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Liens */}
      <div className="mt-4 flex items-center gap-5 border-t border-border pt-4">
        {github ? (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted transition-colors duration-150 hover:text-accent"
          >
            GitHub ↗
          </a>
        ) : (
          <span className="font-mono text-xs text-text-muted">
            {t("internalDeploy")}
          </span>
        )}
        {live && (
          <a
            href={live}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted transition-colors duration-150 hover:text-accent"
          >
            Live ↗
          </a>
        )}
      </div>
    </motion.div>
  );
}
