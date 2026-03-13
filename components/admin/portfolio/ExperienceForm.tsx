"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveExperienceAction,
  deleteExperienceAction,
  type ExperienceFormData,
} from "@/app/admin/(panel)/portfolio/actions";

interface Props {
  initial: ExperienceFormData | null;
  existingId?: string;
}

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors duration-150";

const labelCls = "font-mono text-[0.6rem] tracking-wider text-text-muted";

function emptyData(): ExperienceFormData {
  return {
    locale: "fr",
    company: "",
    startDate: "",
    endDate: "",
    position: "",
    points: [""],
  };
}

export default function ExperienceForm({ initial, existingId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<ExperienceFormData>(initial ?? emptyData());
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isNew = !existingId;

  const update = (patch: Partial<ExperienceFormData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const updatePoint = (idx: number, value: string) => {
    const next = [...data.points];
    next[idx] = value;
    update({ points: next });
  };

  const addPoint = () => update({ points: [...data.points, ""] });

  const removePoint = (idx: number) =>
    update({ points: data.points.filter((_, i) => i !== idx) });

  const handleSave = () => {
    setSaveStatus("saving");
    startTransition(async () => {
      const result = await saveExperienceAction(data, existingId);
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
      await deleteExperienceAction(existingId!);
      router.push("/admin/portfolio");
    });
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Champs principaux */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h2 className={labelCls}>INFORMATIONS</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>LOCALE</label>
            <select
              className={inputCls}
              value={data.locale}
              onChange={(e) => update({ locale: e.target.value as "fr" | "en" })}
              disabled={!isNew}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>ENTREPRISE</label>
            <input
              className={inputCls}
              value={data.company}
              onChange={(e) => update({ company: e.target.value })}
              placeholder="Nom de l'entreprise"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>INTITULÉ DU POSTE</label>
          <input
            className={inputCls}
            value={data.position}
            onChange={(e) => update({ position: e.target.value })}
            placeholder="Développeur Fullstack, DevOps Engineer…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>DATE DE DÉBUT</label>
            <input
              type="date"
              className={inputCls}
              value={data.startDate}
              onChange={(e) => update({ startDate: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>DATE DE FIN (vide = présent)</label>
            <input
              type="date"
              className={inputCls}
              value={data.endDate}
              onChange={(e) => update({ endDate: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Points / réalisations */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h2 className={labelCls}>POINTS / RÉALISATIONS</h2>

        <div className="flex flex-col gap-2">
          {data.points.map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-mono text-xs text-accent select-none">•</span>
              <input
                className={inputCls}
                value={point}
                onChange={(e) => updatePoint(idx, e.target.value)}
                placeholder={`Réalisation ${idx + 1}`}
              />
              {data.points.length > 1 && (
                <button
                  onClick={() => removePoint(idx)}
                  className="shrink-0 font-mono text-xs text-text-muted transition-colors hover:text-red-400"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addPoint}
            className="self-start font-mono text-xs text-text-muted transition-colors hover:text-accent"
          >
            + Ajouter un point
          </button>
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
                Supprimer cette expérience
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
            {isNew ? "Créer l'expérience" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
