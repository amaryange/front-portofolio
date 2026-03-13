import Link from "next/link";
import { loadSkillsData } from "@/app/admin/(panel)/portfolio/actions";
import SkillsEditor from "@/components/admin/portfolio/SkillsEditor";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const groups = await loadSkillsData();

  const totalSkills = groups.reduce((acc, g) => acc + g.skills.length, 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">
            // portfolio / compétences
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-text-primary">
              Compétences
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-text-secondary">
                {groups.length} domaine{groups.length !== 1 ? "s" : ""}
              </span>
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-text-muted">
                {totalSkills} tech{totalSkills !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
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

      <SkillsEditor initial={groups} />
    </div>
  );
}
