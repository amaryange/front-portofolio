import { create } from "zustand";
import { toast } from "sonner";
import {
  getExperiences,
  getProjects,
  getSkills,
  type Experience,
  type Project,
  type SkillGroup,
} from "@/lib/api/portfolio";
import { getErrorMessage } from "@/lib/api/client";

/* ── State ──────────────────────────────────────────────────────── */

interface PortfolioState {
  experiences: Experience[];
  projects: Project[];
  skillGroups: SkillGroup[];

  isLoadingExperiences: boolean;
  isLoadingProjects: boolean;
  isLoadingSkills: boolean;
  error: string | null;

  fetchExperiences: (locale: "fr" | "en") => Promise<void>;
  fetchProjects: (locale: "fr" | "en") => Promise<void>;
  fetchSkills: () => Promise<void>;
  /** Charge les 3 en parallèle. Tolère les échecs partiels. */
  fetchAll: (locale: "fr" | "en") => Promise<void>;
}

/* ── Store ──────────────────────────────────────────────────────── */

export const usePortfolioStore = create<PortfolioState>()((set) => ({
  experiences: [],
  projects: [],
  skillGroups: [],

  isLoadingExperiences: false,
  isLoadingProjects: false,
  isLoadingSkills: false,
  error: null,

  /* ── fetchExperiences ─────────────────────────────────────────── */
  fetchExperiences: async (locale) => {
    set({ isLoadingExperiences: true, error: null });
    try {
      const experiences = await getExperiences(locale);
      set({ experiences, isLoadingExperiences: false });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isLoadingExperiences: false });
      toast.error(msg);
    }
  },

  /* ── fetchProjects ────────────────────────────────────────────── */
  fetchProjects: async (locale) => {
    set({ isLoadingProjects: true, error: null });
    try {
      const projects = await getProjects(locale);
      set({ projects, isLoadingProjects: false });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isLoadingProjects: false });
      toast.error(msg);
    }
  },

  /* ── fetchSkills ──────────────────────────────────────────────── */
  fetchSkills: async () => {
    set({ isLoadingSkills: true, error: null });
    try {
      const skillGroups = await getSkills();
      set({ skillGroups, isLoadingSkills: false });
    } catch (err) {
      const msg = getErrorMessage(err);
      set({ error: msg, isLoadingSkills: false });
      toast.error(msg);
    }
  },

  /* ── fetchAll ─────────────────────────────────────────────────── */
  fetchAll: async (locale) => {
    set({
      isLoadingExperiences: true,
      isLoadingProjects: true,
      isLoadingSkills: true,
      error: null,
    });

    const [expResult, projResult, skillsResult] = await Promise.allSettled([
      getExperiences(locale),
      getProjects(locale),
      getSkills(),
    ]);

    const failures = [expResult, projResult, skillsResult].filter(
      (r) => r.status === "rejected"
    );

    const errorMsg =
      failures.length > 0
        ? `${failures.length} ressource(s) n'ont pas pu être chargées`
        : null;

    set({
      experiences:  expResult.status    === "fulfilled" ? expResult.value    : [],
      projects:     projResult.status   === "fulfilled" ? projResult.value   : [],
      skillGroups:  skillsResult.status === "fulfilled" ? skillsResult.value : [],
      isLoadingExperiences: false,
      isLoadingProjects: false,
      isLoadingSkills: false,
      error: errorMsg,
    });

    if (errorMsg) toast.error(errorMsg);
  },
}));
