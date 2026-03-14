"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderExperiencesAction, reorderProjectsAction } from "@/app/admin/(panel)/portfolio/actions";
import type { Experience, Project } from "@/lib/api/portfolio";

type Tab = "experience" | "projects" | "skills";

interface Props {
  initial: {
    experiences: Experience[];
    projects: Project[];
  };
}

const TABS: { id: Tab; label: string }[] = [
  { id: "experience", label: "Expériences" },
  { id: "projects",   label: "Projets"     },
  { id: "skills",     label: "Compétences" },
];

const panelVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, y: 8, transition: { duration: 0.15, ease: "easeIn" } },
};

/* ── Icons ─────────────────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ── Experience list ─────────────────────────────────────────────── */

function formatPeriod(startDate: string, endDate: string | null) {
  const start = new Date(startDate).getFullYear();
  const end = endDate ? new Date(endDate).getFullYear() : "Présent";
  return `${start} — ${end}`;
}

function SortableExperienceRow({ entry }: { entry: Experience }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`grid grid-cols-[28px_1fr_180px_120px_60px_80px] items-center gap-4 px-5 py-4 transition-colors duration-100 ${
        isDragging ? "bg-accent/5 opacity-75 shadow-lg" : "hover:bg-accent/[0.03]"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        tabIndex={-1}
        className="cursor-grab text-text-muted active:cursor-grabbing"
        aria-label="Déplacer"
      >
        <svg viewBox="0 0 10 16" className="h-3.5 w-2.5 fill-current">
          <circle cx="2" cy="2" r="1.2" /><circle cx="8" cy="2" r="1.2" />
          <circle cx="2" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" />
          <circle cx="2" cy="14" r="1.2" /><circle cx="8" cy="14" r="1.2" />
        </svg>
      </button>
      <Link
        href={`/admin/portfolio/experience/${entry.id}/edit`}
        className="group col-span-5 grid grid-cols-[1fr_180px_120px_60px_80px] items-center gap-4"
      >
        <span className="truncate font-mono text-sm text-text-primary">
          {entry.position || <span className="text-text-muted italic">Sans titre</span>}
        </span>
        <span className="truncate font-mono text-xs text-text-secondary">{entry.company}</span>
        <span className="font-mono text-xs text-text-muted">{formatPeriod(entry.startDate, entry.endDate)}</span>
        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">{entry.locale}</span>
        <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-text-muted transition-colors group-hover:text-accent">
          <EditIcon />
          Éditer
        </span>
      </Link>
    </li>
  );
}

function ExperienceList({ entries: initial }: { entries: Experience[] }) {
  const [entries, setEntries] = useState(initial);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => setMounted(true), []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(entries, oldIndex, newIndex);
    setEntries(reordered);
    startTransition(async () => {
      await reorderExperiencesAction(reordered.map((e) => e.id));
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-text-muted">
          {entries.length} expérience{entries.length !== 1 ? "s" : ""}
        </p>
        <Link
          href="/admin/portfolio/experience/new"
          className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/15"
        >
          <PlusIcon />
          Nouvelle expérience
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="text-text-muted opacity-30"><BriefcaseIcon /></span>
          <div>
            <p className="font-mono text-sm text-text-secondary">Aucune expérience.</p>
            <p className="mt-1 font-mono text-xs text-text-muted">Ajoute ton premier poste.</p>
          </div>
          <Link
            href="/admin/portfolio/experience/new"
            className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/15"
          >
            <PlusIcon />
            Ajouter une expérience
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-[28px_1fr_180px_120px_60px_80px] border-b border-border bg-bg px-5 py-2.5">
            {["", "POSTE", "ENTREPRISE", "PÉRIODE", "LOCALE", ""].map((h, i) => (
              <span key={i} className="font-mono text-[0.6rem] tracking-wider text-text-muted">{h}</span>
            ))}
          </div>
          {mounted ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-border">
                  {entries.map((entry) => (
                    <SortableExperienceRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <ul className="divide-y divide-border">
              {entries.map((entry) => (
                <SortableExperienceRow key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Projects list ──────────────────────────────────────────────── */

function SortableProjectRow({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`grid grid-cols-[28px_1fr_60px_auto_80px] items-center gap-4 px-5 py-4 transition-colors duration-100 ${
        isDragging ? "bg-accent/5 opacity-75 shadow-lg" : "hover:bg-accent/[0.03]"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        tabIndex={-1}
        className="cursor-grab text-text-muted active:cursor-grabbing"
        aria-label="Déplacer"
      >
        <svg viewBox="0 0 10 16" className="h-3.5 w-2.5 fill-current">
          <circle cx="2" cy="2" r="1.2" /><circle cx="8" cy="2" r="1.2" />
          <circle cx="2" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" />
          <circle cx="2" cy="14" r="1.2" /><circle cx="8" cy="14" r="1.2" />
        </svg>
      </button>
      <Link
        href={`/admin/portfolio/projects/${project.id}/edit`}
        className="group flex items-center gap-4 col-span-4 grid grid-cols-[1fr_60px_auto_80px]"
      >
        <span className="truncate font-mono text-sm text-text-primary">
          {project.title || <span className="text-text-muted italic">Sans titre</span>}
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">{project.locale}</span>
        <div className="flex flex-wrap gap-1">
          {project.techs.slice(0, 4).map((t) => (
            <span key={t.id} className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.55rem] text-text-muted">
              {t.name}
            </span>
          ))}
          {project.techs.length > 4 && (
            <span className="font-mono text-[0.55rem] text-text-muted">+{project.techs.length - 4}</span>
          )}
        </div>
        <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-text-muted transition-colors group-hover:text-accent">
          <EditIcon />
          Éditer
        </span>
      </Link>
    </li>
  );
}

function ProjectsList({ projects: initial }: { projects: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => setMounted(true), []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);
    startTransition(async () => {
      await reorderProjectsAction(reordered.map((p) => p.id));
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-text-muted">
          {projects.length} projet{projects.length !== 1 ? "s" : ""}
        </p>
        <Link
          href="/admin/portfolio/projects/new"
          className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/15"
        >
          <PlusIcon />
          Nouveau projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="text-text-muted opacity-30"><FolderIcon /></span>
          <div>
            <p className="font-mono text-sm text-text-secondary">Aucun projet.</p>
            <p className="mt-1 font-mono text-xs text-text-muted">Ajoute ton premier projet.</p>
          </div>
          <Link
            href="/admin/portfolio/projects/new"
            className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/15"
          >
            <PlusIcon />
            Ajouter un projet
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-[28px_1fr_60px_auto_80px] border-b border-border bg-bg px-5 py-2.5">
            {["", "TITRE", "LOCALE", "TECHNOS", ""].map((h, i) => (
              <span key={i} className="font-mono text-[0.6rem] tracking-wider text-text-muted">{h}</span>
            ))}
          </div>
          {mounted ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-border">
                  {projects.map((project) => (
                    <SortableProjectRow key={project.id} project={project} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <ul className="divide-y divide-border">
              {projects.map((project) => (
                <SortableProjectRow key={project.id} project={project} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Skills — link to dedicated edit page ────────────────────────── */

function SkillsViewer() {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="font-mono text-xs text-text-muted">
        Gérer les domaines et technologies affichés dans la section Compétences du portfolio.
      </p>
      <Link
        href="/admin/portfolio/skills"
        className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/15"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Éditer les compétences
      </Link>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */

export default function PortfolioTabs({ initial }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("experience");

  const counts: Record<Tab, number | undefined> = {
    experience: initial.experiences.length,
    projects: initial.projects.length,
    skills: undefined,
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">

      {/* Header */}
      <div>
        <p className="font-mono text-[0.6rem] tracking-[0.18em] text-text-muted">
          // portfolio
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
          Portfolio
        </h1>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 font-mono text-xs transition-colors duration-150 ${
              activeTab === tab.id
                ? "text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {counts[tab.id] !== undefined && (
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[0.55rem] ${
                activeTab === tab.id
                  ? "bg-accent/15 text-accent"
                  : "bg-surface text-text-muted"
              }`}>
                {counts[tab.id]}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                transition={{ duration: 0.2, ease: "easeInOut" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={panelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {activeTab === "experience" && (
            <ExperienceList entries={initial.experiences} />
          )}
          {activeTab === "projects" && (
            <ProjectsList projects={initial.projects} />
          )}
          {activeTab === "skills" && (
            <SkillsViewer />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
