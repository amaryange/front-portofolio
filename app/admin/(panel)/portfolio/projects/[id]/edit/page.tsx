import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api/server";
import type { Project } from "@/lib/api/portfolio";
import type { ProjectFormData } from "@/app/admin/(panel)/portfolio/actions";
import ProjectForm from "@/components/admin/portfolio/ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project: Project;
  try {
    const res = await serverFetch<{ data: Project }>(`/admin/projects/${id}`);
    project = res.data;
  } catch {
    notFound();
  }

  const initial: ProjectFormData = {
    locale: project.locale,
    title: project.title,
    description: project.description,
    techs: project.techs.map((t) => t.name),
    githubUrl: project.githubUrl ?? "",
    url: project.url ?? "",
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">
            // portfolio / projets / édition
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            {project.title || "Projet sans titre"}
          </h1>
          {project.techs.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {project.techs.slice(0, 4).map((t) => (
                <span
                  key={t.id}
                  className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] text-text-muted"
                >
                  {t.name}
                </span>
              ))}
            </div>
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

      <ProjectForm initial={initial} existingId={id} />
    </div>
  );
}
