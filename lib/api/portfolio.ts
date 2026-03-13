import { apiFetch, type ApiResponse } from "./client";

/* ── Types ──────────────────────────────────────────────────────── */

export interface ExperiencePoint {
  id: string;
  content: string;
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  locale: "fr" | "en";
  description: string;
  startDate: string;
  endDate: string | null;
  order: number;
  points: ExperiencePoint[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTech {
  id: string;
  projectId: string;
  name: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  locale: "fr" | "en";
  description: string;
  url: string | null;
  githubUrl: string | null;
  image: string | null;
  techs: ProjectTech[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0–100
  order: number;
}

export interface SkillGroup {
  id: string;
  name: string;
  order: number;
  skills: Skill[];
}

/* ── Endpoints ──────────────────────────────────────────────────── */

/**
 * GET /experiences?locale
 * Liste des expériences triées par ordre.
 */
export async function getExperiences(locale: "fr" | "en"): Promise<Experience[]> {
  const res = await apiFetch<ApiResponse<Experience[]>>("/experiences", {
    params: { locale },
  });
  return res.data;
}

/**
 * GET /projects?locale
 * Liste des projets triés par ordre.
 */
export async function getProjects(locale: "fr" | "en"): Promise<Project[]> {
  const res = await apiFetch<ApiResponse<Project[]>>("/projects", {
    params: { locale },
  });
  return res.data;
}

/**
 * GET /skills
 * Groupes de compétences avec leurs skills et niveaux.
 */
export async function getSkills(): Promise<SkillGroup[]> {
  const res = await apiFetch<ApiResponse<SkillGroup[]>>("/skills");
  return res.data;
}
