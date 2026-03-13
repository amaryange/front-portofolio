import { apiFetch, type ApiResponse } from "../client";
import type { Project } from "../portfolio";

/* ── Types ──────────────────────────────────────────────────────── */

export interface CreateProjectPayload {
  title: string;
  locale: "fr" | "en";
  description: string;
  url?: string | null;
  githubUrl?: string | null;
  image?: string | null;
  techs?: string[];
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

/* ── Endpoints ──────────────────────────────────────────────────── */

export const getAdminProjects = async (): Promise<Project[]> => {
  const res = await apiFetch<ApiResponse<Project[]>>("/admin/projects");
  return res.data;
};

export const createProject = async (
  payload: CreateProjectPayload
): Promise<Project> => {
  const res = await apiFetch<ApiResponse<Project>>("/admin/projects", {
    method: "POST",
    body: payload,
  });
  return res.data;
};

export const updateProject = async (
  id: string,
  payload: UpdateProjectPayload
): Promise<Project> => {
  const res = await apiFetch<ApiResponse<Project>>(`/admin/projects/${id}`, {
    method: "PUT",
    body: payload,
  });
  return res.data;
};

export const reorderProjects = (ids: string[]) =>
  apiFetch("/admin/projects/reorder", {
    method: "PUT",
    body: { ids },
  });

export const deleteProject = (id: string) =>
  apiFetch(`/admin/projects/${id}`, { method: "DELETE" });
