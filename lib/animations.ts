import type { Variants } from "framer-motion";

/** Révélation par le bas — utilisé pour les éléments de page au chargement */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Conteneur qui échelonne l'animation de ses enfants */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/** Apparition avec légère mise à l'échelle — cartes, badges */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/**
 * Utiliser whileInView pour les sections sous le fold :
 *
 * <motion.section
 *   initial="initial"
 *   whileInView="animate"
 *   viewport={{ once: true, margin: "-100px" }}
 *   variants={staggerContainer}
 * >
 */
