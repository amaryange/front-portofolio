import Link from "next/link";
import ExperienceForm from "@/components/admin/portfolio/ExperienceForm";

export default function NewExperiencePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">
            // portfolio / expériences / nouveau
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            Nouvelle expérience
          </h1>
        </div>
        <Link
          href="/admin/portfolio"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-text-muted transition-all hover:border-accent/40 hover:text-accent"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </Link>
      </div>

      <ExperienceForm initial={null} />
    </div>
  );
}
