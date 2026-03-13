import { getLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import SectionTracker from "@/components/analytics/SectionTracker";
import type { Experience as ExperienceType, Project, SkillGroup } from "@/lib/api/portfolio";

/* ── Server-side fetch for public portfolio data ─────────────────── */

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/api/v1`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export default async function Home() {
  const locale = (await getLocale()) as "fr" | "en";

  const [experiencesRes, projectsRes, skillGroupsRes] = await Promise.allSettled([
    publicFetch<{ data: ExperienceType[] }>(`/experiences?locale=${locale}`),
    publicFetch<{ data: Project[] }>(`/projects?locale=${locale}`),
    publicFetch<{ data: SkillGroup[] }>("/skills"),
  ]);

const experiences = experiencesRes.status === "fulfilled" ? experiencesRes.value.data : [];
  const projects    = projectsRes.status    === "fulfilled" ? projectsRes.value.data    : [];
  const skillGroups = skillGroupsRes.status === "fulfilled" ? skillGroupsRes.value.data : [];

  return (
    <main>
      <SectionTracker />
      <Hero />
      <About />
      <Skills skillGroups={skillGroups} />
      <Experience experiences={experiences} />
      <Projects projects={projects} />
      <Contact />
    </main>
  );
}
