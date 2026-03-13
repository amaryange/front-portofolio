import { apiFetch, type ApiResponse } from "../client";
import type { Experience } from "../portfolio";

/* ── Types ──────────────────────────────────────────────────────── */

export interface CreateExperiencePayload {
  company: string;
  position: string;
  locale: "fr" | "en";
  description: string;
  startDate: string;
  endDate?: string | null;
  points?: { content: string }[];
}

export type UpdateExperiencePayload = Partial<CreateExperiencePayload>;

/* ── Endpoints ──────────────────────────────────────────────────── */

export const getAdminExperiences = async (): Promise<Experience[]> => {
  const res = await apiFetch<ApiResponse<Experience[]>>("/admin/experiences");
  return res.data;
};

export const createExperience = async (
  payload: CreateExperiencePayload
): Promise<Experience> => {
  const res = await apiFetch<ApiResponse<Experience>>("/admin/experiences", {
    method: "POST",
    body: payload,
  });
  return res.data;
};

export const updateExperience = async (
  id: string,
  payload: UpdateExperiencePayload
): Promise<Experience> => {
  const res = await apiFetch<ApiResponse<Experience>>(
    `/admin/experiences/${id}`,
    { method: "PUT", body: payload }
  );
  return res.data;
};

export const reorderExperiences = (ids: string[]) =>
  apiFetch("/admin/experiences/reorder", {
    method: "PUT",
    body: { ids },
  });

export const deleteExperience = (id: string) =>
  apiFetch(`/admin/experiences/${id}`, { method: "DELETE" });
