"use client";

import { useActionState } from "react";
import { motion, type Variants } from "framer-motion";
import { loginAction } from "./actions";

const item: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const container: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Grille de fond */}
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-30" />

      {/* Halo */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)",
        }}
      />

      <motion.div
        variants={container}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-10">
          <p className="mb-2 font-mono text-xs tracking-[0.25em] text-accent">
            // admin
          </p>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            M. Amary
          </h1>
          <p className="mt-1 font-mono text-sm text-text-muted">
            Panel d&apos;administration
          </p>
        </motion.div>

        {/* Formulaire */}
        <form action={action} className="flex flex-col gap-5">
          {/* Email */}
          <motion.div variants={item} className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-mono text-xs tracking-wider text-text-muted"
            >
              EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@exemple.com"
              className="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30"
            />
          </motion.div>

          {/* Mot de passe */}
          <motion.div variants={item} className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-mono text-xs tracking-wider text-text-muted"
            >
              MOT DE PASSE
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              className="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30"
            />
          </motion.div>

          {/* Erreur */}
          {state?.error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs text-red-400"
            >
              {state.error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.div variants={item}>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg border border-accent/40 bg-accent/10 px-6 py-3 font-mono text-sm text-accent transition-all duration-200 hover:bg-accent/15 hover:border-accent/60 hover:shadow-[0_0_20px_rgba(0,212,170,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="terminal-cursor" />
                  Connexion…
                </span>
              ) : (
                "Connexion →"
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </main>
  );
}
