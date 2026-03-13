"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";

interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper scroll-triggered pour les sections sous le fold.
 * Les enfants directs avec variants={fadeInUp | scaleIn} s'animent
 * en cascade grâce au staggerChildren du parent.
 */
export default function AnimatedSection({ children, className }: Props) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}
