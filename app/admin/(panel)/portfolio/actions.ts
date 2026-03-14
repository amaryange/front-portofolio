"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api/server";
import type { Experience, Project, SkillGroup, Skill } from "@/lib/api/portfolio";

/* ── Types formulaires ───────────────────────────────────────────── */

export interface ExperienceFormData {
  locale: "fr" | "en";
  company: string;
  startDate: string;
  endDate: string;
  position: string;
  points: string[];
}

export interface ProjectFormData {
  locale: "fr" | "en";
  title: string;
  description: string;
  techs: string[];
  githubUrl: string;
  url: string;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function revalidatePortfolio() {
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
}

/* ── Portfolio data (lecture) ────────────────────────────────────── */

export async function loadPortfolioData(): Promise<{
  experiences: Experience[];
  projects: Project[];
}> {
  const [expRes, projRes] = await Promise.all([
    serverFetch<{ data: Experience[] }>("/admin/experiences").catch(() => ({ data: [] as Experience[] })),
    serverFetch<{ data: Project[] }>("/admin/projects").catch(() => ({ data: [] as Project[] })),
  ]);
  return { experiences: expRes.data, projects: projRes.data };
}

/* ── Expériences ─────────────────────────────────────────────────── */

export async function saveExperienceAction(
  data: ExperienceFormData,
  existingId?: string
): Promise<{ id: string; error?: string }> {
  try {
    const payload = {
      company: data.company,
      position: data.position,
      locale: data.locale,
      description: "",
      startDate: data.startDate,
      endDate: data.endDate || null,
      points: data.points.filter(Boolean).map((content) => ({ content })),
    };

    const res = existingId
      ? await serverFetch<{ data: Experience }>(`/admin/experiences/${existingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await serverFetch<{ data: Experience }>("/admin/experiences", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    revalidatePortfolio();
    return { id: res.data.id };
  } catch (err) {
    return { id: existingId ?? "", error: (err as Error).message };
  }
}

export async function deleteExperienceAction(
  id: string
): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/experiences/${id}`, { method: "DELETE" });
    revalidatePortfolio();
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/* ── Projets ─────────────────────────────────────────────────────── */

export async function saveProjectAction(
  data: ProjectFormData,
  existingId?: string
): Promise<{ id: string; error?: string }> {
  try {
    const payload = {
      title: data.title,
      description: data.description,
      locale: data.locale,
      techs: data.techs,
      githubUrl: data.githubUrl || null,
      url: data.url || null,
    };

    const res = existingId
      ? await serverFetch<{ data: Project }>(`/admin/projects/${existingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await serverFetch<{ data: Project }>("/admin/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    revalidatePortfolio();
    return { id: res.data.id };
  } catch (err) {
    return { id: existingId ?? "", error: (err as Error).message };
  }
}

export async function deleteProjectAction(
  id: string
): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/projects/${id}`, { method: "DELETE" });
    revalidatePortfolio();
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/* ── Compétences ─────────────────────────────────────────────────── */

export async function loadSkillsData(): Promise<SkillGroup[]> {
  try {
    const res = await serverFetch<{ data: SkillGroup[] }>("/admin/skills");
    return res.data;
  } catch {
    return [];
  }
}

export async function addGroupAction(
  name: string
): Promise<{ group?: SkillGroup; error?: string }> {
  try {
    const res = await serverFetch<{ data: SkillGroup }>("/admin/skills/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    revalidatePortfolio();
    return { group: res.data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function renameGroupAction(
  id: string,
  name: string
): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/skills/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
    revalidatePortfolio();
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function deleteGroupAction(id: string): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/skills/groups/${id}`, { method: "DELETE" });
    revalidatePortfolio();
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function addSkillAction(
  groupId: string,
  name: string
): Promise<{ skill?: Skill; error?: string }> {
  try {
    const res = await serverFetch<{ data: Skill }>(
      `/admin/skills/groups/${groupId}/skills`,
      { method: "POST", body: JSON.stringify({ name, level: 0 }) }
    );
    revalidatePortfolio();
    return { skill: res.data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function removeSkillAction(
  groupId: string,
  skillId: string
): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/skills/groups/${groupId}/skills/${skillId}`, {
      method: "DELETE",
    });
    revalidatePortfolio();
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function reorderExperiencesAction(
  ids: string[]
): Promise<{ error?: string }> {
  try {
    await serverFetch("/admin/experiences/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    });
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function reorderProjectsAction(
  ids: string[]
): Promise<{ error?: string }> {
  try {
    await serverFetch("/admin/projects/reorder", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    });
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function reorderSkillsAction(
  groupId: string,
  ids: string[]
): Promise<{ error?: string }> {
  try {
    await serverFetch(`/admin/skills/groups/${groupId}/skills/reorder`, {
      method: "PUT",
      body: JSON.stringify({ ids }),
    });
    // Pas de revalidatePath : le réordonnancement est géré en optimistic update
    // côté client. revalidatePath déclencherait un refresh serveur qui écraserait
    // l'état local avant que l'API confirme le nouvel ordre.
    return {};
  } catch (err) {
    return { error: (err as Error).message };
  }
}
