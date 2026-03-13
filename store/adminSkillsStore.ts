import { create } from "zustand";
import { toast } from "sonner";
import {
  getAdminSkills,
  createGroup,
  updateGroup,
  reorderGroups,
  deleteGroup,
  createSkill,
  updateSkill,
  deleteSkill,
  type CreateSkillPayload,
} from "@/lib/api/admin/skills";
import { getErrorMessage } from "@/lib/api/client";
import type { SkillGroup, Skill } from "@/lib/api/portfolio";

interface AdminSkillsState {
  groups: SkillGroup[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchSkills: () => Promise<void>;
  createGroup: (name: string) => Promise<SkillGroup>;
  updateGroup: (groupId: string, name: string) => Promise<void>;
  reorderGroups: (ids: string[]) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  createSkill: (groupId: string, payload: CreateSkillPayload) => Promise<Skill>;
  updateSkill: (groupId: string, skillId: string, payload: Partial<CreateSkillPayload>) => Promise<void>;
  deleteSkill: (groupId: string, skillId: string) => Promise<void>;
}

function patchGroup(
  groups: SkillGroup[],
  groupId: string,
  fn: (g: SkillGroup) => SkillGroup
): SkillGroup[] {
  return groups.map((g) => (g.id === groupId ? fn(g) : g));
}

export const useAdminSkillsStore = create<AdminSkillsState>()((set, get) => ({
  groups: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSkills: async () => {
    set({ isLoading: true, error: null });
    try {
      const groups = await getAdminSkills();
      set({ groups, isLoading: false });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  createGroup: async (name) => {
    set({ isSaving: true, error: null });
    const tid = toast.loading("Création du groupe…");
    try {
      const created = await createGroup(name);
      set((s) => ({ groups: [...s.groups, created], isSaving: false }));
      toast.success(`Groupe "${name}" créé`, { id: tid });
      return created;
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSaving: false });
      toast.error(msg, { id: tid });
      throw err;
    }
  },

  updateGroup: async (groupId, name) => {
    set({ isSaving: true, error: null });
    const tid = toast.loading("Enregistrement…");
    try {
      const updated = await updateGroup(groupId, name);
      set((s) => ({ groups: patchGroup(s.groups, groupId, () => updated), isSaving: false }));
      toast.success("Groupe mis à jour", { id: tid });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSaving: false });
      toast.error(msg, { id: tid });
      throw err;
    }
  },

  reorderGroups: async (ids) => {
    const previous = get().groups;
    const reordered = ids
      .map((id) => previous.find((g) => g.id === id))
      .filter(Boolean) as SkillGroup[];
    set({ groups: reordered });
    try {
      await reorderGroups(ids);
      toast.success("Ordre sauvegardé");
    } catch (err) {
      set({ groups: previous, error: getErrorMessage(err) });
      toast.error("Impossible de sauvegarder l'ordre");
    }
  },

  deleteGroup: async (groupId) => {
    const tid = toast.loading("Suppression du groupe…");
    try {
      await deleteGroup(groupId);
      set((s) => ({ groups: s.groups.filter((g) => g.id !== groupId) }));
      toast.success("Groupe supprimé", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },

  createSkill: async (groupId, payload) => {
    set({ isSaving: true, error: null });
    const tid = toast.loading("Ajout de la compétence…");
    try {
      const skill = await createSkill(groupId, payload);
      set((s) => ({
        groups: patchGroup(s.groups, groupId, (g) => ({
          ...g,
          skills: [...g.skills, skill],
        })),
        isSaving: false,
      }));
      toast.success(`"${payload.name}" ajouté`, { id: tid });
      return skill;
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSaving: false });
      toast.error(msg, { id: tid });
      throw err;
    }
  },

  updateSkill: async (groupId, skillId, payload) => {
    set({ isSaving: true, error: null });
    const tid = toast.loading("Enregistrement…");
    try {
      const updated = await updateSkill(groupId, skillId, payload);
      set((s) => ({
        groups: patchGroup(s.groups, groupId, (g) => ({
          ...g,
          skills: g.skills.map((sk) => (sk.id === skillId ? updated : sk)),
        })),
        isSaving: false,
      }));
      toast.success("Compétence mise à jour", { id: tid });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isSaving: false });
      toast.error(msg, { id: tid });
      throw err;
    }
  },

  deleteSkill: async (groupId, skillId) => {
    const tid = toast.loading("Suppression…");
    try {
      await deleteSkill(groupId, skillId);
      set((s) => ({
        groups: patchGroup(s.groups, groupId, (g) => ({
          ...g,
          skills: g.skills.filter((sk) => sk.id !== skillId),
        })),
      }));
      toast.success("Compétence supprimée", { id: tid });
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tid });
    }
  },
}));
