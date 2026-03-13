import { create } from "zustand";
import { toast } from "sonner";
import {
  getAdminExperiences,
  createExperience,
  updateExperience,
  reorderExperiences,
  deleteExperience,
  type CreateExperiencePayload,
  type UpdateExperiencePayload,
} from "@/lib/api/admin/experiences";
import { getErrorMessage } from "@/lib/api/client";
import type { Experience } from "@/lib/api/portfolio";

interface AdminExperiencesState {
  experiences: Experience[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchExperiences: () => Promise<void>;
  createExperience: (payload: CreateExperiencePayload) => Promise<Experience>;
  updateExperience: (id: string, payload: UpdateExperiencePayload) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
}

export const useAdminExperiencesStore = create<AdminExperiencesState>()(
  (set, get) => ({
    experiences: [],
    isLoading: false,
    isSaving: false,
    error: null,

    fetchExperiences: async () => {
      set({ isLoading: true, error: null });
      try {
        const experiences = await getAdminExperiences();
        set({ experiences, isLoading: false });
      } catch (err) {
        const msg = getErrorMessage(err);
        set({ error: msg, isLoading: false });
        toast.error(msg);
      }
    },

    createExperience: async (payload) => {
      set({ isSaving: true, error: null });
      const tid = toast.loading("Création en cours…");
      try {
        const created = await createExperience(payload);
        set((s) => ({ experiences: [...s.experiences, created], isSaving: false }));
        toast.success("Expérience créée", { id: tid });
        return created;
      } catch (err) {
        const msg = getErrorMessage(err);
        set({ error: msg, isSaving: false });
        toast.error(msg, { id: tid });
        throw err;
      }
    },

    updateExperience: async (id, payload) => {
      set({ isSaving: true, error: null });
      const tid = toast.loading("Enregistrement…");
      try {
        const updated = await updateExperience(id, payload);
        set((s) => ({
          experiences: s.experiences.map((e) => (e.id === id ? updated : e)),
          isSaving: false,
        }));
        toast.success("Expérience enregistrée", { id: tid });
      } catch (err) {
        const msg = getErrorMessage(err);
        set({ error: msg, isSaving: false });
        toast.error(msg, { id: tid });
        throw err;
      }
    },

    reorder: async (ids) => {
      const previous = get().experiences;
      const reordered = ids
        .map((id) => previous.find((e) => e.id === id))
        .filter(Boolean) as Experience[];
      set({ experiences: reordered });
      try {
        await reorderExperiences(ids);
        toast.success("Ordre sauvegardé");
      } catch (err) {
        set({ experiences: previous, error: getErrorMessage(err) });
        toast.error("Impossible de sauvegarder l'ordre");
      }
    },

    deleteExperience: async (id) => {
      const tid = toast.loading("Suppression…");
      try {
        await deleteExperience(id);
        set((s) => ({ experiences: s.experiences.filter((e) => e.id !== id) }));
        toast.success("Expérience supprimée", { id: tid });
      } catch (err) {
        toast.error(getErrorMessage(err), { id: tid });
      }
    },
  })
);
