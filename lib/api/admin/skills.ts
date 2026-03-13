import { apiFetch, type ApiResponse } from "../client";
import type { SkillGroup, Skill } from "../portfolio";

/* ── Types ──────────────────────────────────────────────────────── */

export interface CreateGroupPayload {
  name: string;
}

export interface CreateSkillPayload {
  name: string;
  level: number; // 0–100
}

/* ── Endpoints — Groupes ────────────────────────────────────────── */

export const getAdminSkills = async (): Promise<SkillGroup[]> => {
  const res = await apiFetch<ApiResponse<SkillGroup[]>>("/admin/skills");
  return res.data;
};

export const createGroup = async (name: string): Promise<SkillGroup> => {
  const res = await apiFetch<ApiResponse<SkillGroup>>("/admin/skills/groups", {
    method: "POST",
    body: { name } satisfies CreateGroupPayload,
  });
  return res.data;
};

export const updateGroup = async (
  groupId: string,
  name: string
): Promise<SkillGroup> => {
  const res = await apiFetch<ApiResponse<SkillGroup>>(
    `/admin/skills/groups/${groupId}`,
    { method: "PUT", body: { name } }
  );
  return res.data;
};

export const reorderGroups = (ids: string[]) =>
  apiFetch("/admin/skills/groups/reorder", {
    method: "PUT",
    body: { ids },
  });

export const deleteGroup = (groupId: string) =>
  apiFetch(`/admin/skills/groups/${groupId}`, { method: "DELETE" });

/* ── Endpoints — Skills ─────────────────────────────────────────── */

export const createSkill = async (
  groupId: string,
  payload: CreateSkillPayload
): Promise<Skill> => {
  const res = await apiFetch<ApiResponse<Skill>>(
    `/admin/skills/groups/${groupId}/skills`,
    { method: "POST", body: payload }
  );
  return res.data;
};

export const updateSkill = async (
  groupId: string,
  skillId: string,
  payload: Partial<CreateSkillPayload>
): Promise<Skill> => {
  const res = await apiFetch<ApiResponse<Skill>>(
    `/admin/skills/groups/${groupId}/skills/${skillId}`,
    { method: "PUT", body: payload }
  );
  return res.data;
};

export const deleteSkill = (groupId: string, skillId: string) =>
  apiFetch(`/admin/skills/groups/${groupId}/skills/${skillId}`, {
    method: "DELETE",
  });
