"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveProjectAction,
  deleteProjectAction,
  type ProjectFormData,
} from "@/app/admin/(panel)/portfolio/actions";
import TagsInput from "@/components/ui/TagsInput";

interface Props {
  initial: ProjectFormData | null;
  existingId?: string;
}

const TECH_SUGGESTIONS = [
  "Spring Boot", "AdonisJS", "Node.js", "Express", "NestJS",
  "React Native", "Expo", "Flutter",
  "Next.js", "React", "Vue", "TypeScript", "JavaScript", "Tailwind CSS",
  "Docker", "Kubernetes", "OpenTelemetry", "Grafana", "Prometheus",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
  "AWS", "GCP", "Azure", "Vercel", "Railway",
  "GraphQL", "tRPC", "REST", "WebSocket",
  "Go", "Python", "Rust", "Java",
  "Framer Motion", "Prisma", "Drizzle",
];

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors duration-150";

const labelCls = "font-mono text-[0.6rem] tracking-wider text-text-muted";

function emptyProject(): ProjectFormData {
  return { locale: "fr", title: "", description: "", techs: [], githubUrl: "", url: "" };
}

export default function ProjectForm({ initial, existingId }: Props) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectFormData>(initial ?? emptyProject());
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isNew = !existingId;

  const update = (patch: Partial<ProjectFormData>) =>
    setProject((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    setSaveStatus("saving");
    startTransition(async () => {
      const result = await saveProjectAction(project, existingId);
      if (result.error) {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus("idle");
          if (isNew) router.push("/admin/portfolio");
        }, 1200);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteProjectAction(existingId!);
      router.push("/admin/portfolio");
    });
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Contenu */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h2 className={labelCls}>INFORMATIONS</h2>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>LOCALE</label>
          <select
            className={inputCls}
            value={project.locale}
            onChange={(e) => update({ locale: e.target.value as "fr" | "en" })}
            disabled={!isNew}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>TITRE DU PROJET</label>
          <input
            className={inputCls}
            value={project.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Nom du projet"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>DESCRIPTION</label>
          <textarea
            className={`${inputCls} min-h-[96px] resize-y`}
            value={project.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Description courte du projet"
          />
        </div>
      </section>

      {/* Infos partagées */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h2 className={labelCls}>TECHNOS & LIENS</h2>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>TECHNOS</label>
          <TagsInput
            value={project.techs}
            onChange={(techs) => update({ techs })}
            suggestions={TECH_SUGGESTIONS}
            placeholder="React Native, Docker…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>GITHUB</label>
            <input
              className={inputCls}
              value={project.githubUrl}
              onChange={(e) => update({ githubUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>LIVE (optionnel)</label>
            <input
              className={inputCls}
              value={project.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
      </section>

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {!isNew ? (
          <AnimatePresence mode="wait">
            {!showDelete ? (
              <motion.button
                key="delete-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDelete(true)}
                className="font-mono text-xs text-text-muted transition-colors hover:text-red-400"
              >
                Supprimer ce projet
              </motion.button>
            ) : (
              <motion.div
                key="delete-confirm"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center gap-3"
              >
                <span className="font-mono text-xs text-text-muted">Confirmer ?</span>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="font-mono text-xs text-red-400 transition-colors hover:text-red-300 disabled:opacity-40"
                >
                  Oui, supprimer
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="font-mono text-xs text-text-muted transition-colors hover:text-text-primary"
                >
                  Annuler
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {saveStatus !== "idle" && (
              <motion.span
                key={saveStatus}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className={`font-mono text-xs ${
                  saveStatus === "saved" ? "text-accent" :
                  saveStatus === "error" ? "text-red-400" : "text-text-muted"
                }`}
              >
                {saveStatus === "saving" && "Sauvegarde…"}
                {saveStatus === "saved"  && "✓ Enregistré"}
                {saveStatus === "error"  && "✗ Erreur"}
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg border border-accent/40 bg-accent/10 px-5 py-2 font-mono text-xs text-accent transition-all hover:bg-accent/15 hover:border-accent/60 disabled:opacity-40"
          >
            {isNew ? "Créer le projet" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
