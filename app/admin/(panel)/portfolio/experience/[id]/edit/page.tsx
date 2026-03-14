import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api/server";
import type { Experience } from "@/lib/api/portfolio";
import type { ExperienceFormData } from "@/app/admin/(panel)/portfolio/actions";
import ExperienceForm from "@/components/admin/portfolio/ExperienceForm";

export const dynamic = "force-dynamic";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await serverFetch<{ data: Experience }>(`/admin/experiences/${id}`).catch(() => null);
  if (!res) notFound();
  const exp = res.data;

  const initial: ExperienceFormData = {
    locale: exp.locale,
    company: exp.company,
    position: exp.position,
    startDate: exp.startDate.slice(0, 10),
    endDate: exp.endDate ? exp.endDate.slice(0, 10) : "",
    points: exp.points.length > 0 ? exp.points.map((p) => p.content) : [""],
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">
            // portfolio / expériences / édition
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            {exp.position || "Expérience sans titre"}
          </h1>
          {exp.company && (
            <p className="mt-0.5 font-mono text-sm text-accent">{exp.company}</p>
          )}
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

      <ExperienceForm initial={initial} existingId={id} />
    </div>
  );
}
