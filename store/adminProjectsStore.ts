import { create } from "zustand";
import { toast } from "sonner";
import {
  getAdminProjects,
  createProject,
  updateProject,
  reorderProjects,
  deleteProject,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from "@/lib/api/admin/projects";
import { getErrorMessage } from "@/lib/api/client";
import type { Project } from "@/lib/api/portfolio";

interface AdminProjectsState {
  projects: Project[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (payload: CreateProjectPayload) => Promise<Project>;
  updateProject: (id: string, payload: UpdateProjectPayload) => Promise<void>;
  reorder: (ids: string[]) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useAdminProjectsStore = create<AdminProjectsState>()(
  (set, get) => ({
    projects: [],
    isLoading: false,
    isSaving: false,
    error: null,

    fetchProjects: async () => {
      set({ isLoading: true, error: null });
      try {
        const projects = await getAdminProjects();
        set({ projects, isLoading: false });
      } catch (err) {
        const msg = getErrorMessage(err);
        set({ error: msg, isLoading: false });
        toast.error(msg);
      }
    },

    createProject: async (payload) => {
      set({ isSaving: true, error: null });
      const tid = toast.loading("Création en cours…");
      try {
        const created = await createProject(payload);
        set((s) => ({ projects: [...s.projects, created], isSaving: false }));
        toast.success("Projet créé", { id: tid });
        return created;
      } catch (err) {
        const msg = getErrorMessage(err);
        set({ error: msg, isSaving: false });
        toast.error(msg, { id: tid });
        throw err;
      }
    },

    updateProject: async (id, payload) => {
      set({ isSaving: true, error: null });
      const tid = toast.loading("Enregistrement…");
      try {
        const updated = await updateProject(id, payload);
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? updated : p)),
          isSaving: false,
        }));
        toast.success("Projet enregistré", { id: tid });
      } catch (err) {
        const msg = getErrorMessage(err);
        set({ error: msg, isSaving: false });
        toast.error(msg, { id: tid });
        throw err;
      }
    },

    reorder: async (ids) => {
      const previous = get().projects;
      const reordered = ids
        .map((id) => previous.find((p) => p.id === id))
        .filter(Boolean) as Project[];
      set({ projects: reordered });
      try {
        await reorderProjects(ids);
        toast.success("Ordre sauvegardé");
      } catch (err) {
        set({ projects: previous, error: getErrorMessage(err) });
        toast.error("Impossible de sauvegarder l'ordre");
      }
    },

    deleteProject: async (id) => {
      const tid = toast.loading("Suppression…");
      try {
        await deleteProject(id);
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
        toast.success("Projet supprimé", { id: tid });
      } catch (err) {
        toast.error(getErrorMessage(err), { id: tid });
      }
    },
  })
);
