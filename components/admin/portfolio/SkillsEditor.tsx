"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
import {
  addGroupAction,
  renameGroupAction,
  deleteGroupAction,
  addSkillAction,
  removeSkillAction,
  reorderSkillsAction,
} from "@/app/admin/(panel)/portfolio/actions";
import type { SkillGroup, Skill } from "@/lib/api/portfolio";

interface Props {
  initial: SkillGroup[];
}

const itemVariants: Variants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors duration-150";

const labelCls = "font-mono text-[0.6rem] tracking-wider text-text-muted";

function SortableSkill({
  skill,
  isPending,
  onRemove,
}: {
  skill: Skill;
  isPending: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: skill.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border bg-bg px-3 py-2 transition-colors ${
        isDragging ? "border-accent/50 bg-accent/5 opacity-75 shadow-lg" : "border-border"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-muted active:cursor-grabbing"
        aria-label="Déplacer"
        tabIndex={-1}
      >
        <svg viewBox="0 0 10 16" className="h-3.5 w-2.5 fill-current">
          <circle cx="2" cy="2" r="1.2" /><circle cx="8" cy="2" r="1.2" />
          <circle cx="2" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" />
          <circle cx="2" cy="14" r="1.2" /><circle cx="8" cy="14" r="1.2" />
        </svg>
      </button>
      <span className="flex-1 font-mono text-xs text-text-secondary">{skill.name}</span>
      <button
        onClick={onRemove}
        disabled={isPending}
        className="text-text-muted transition-colors hover:text-red-400 disabled:opacity-40"
        aria-label={`Supprimer ${skill.name}`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function SkillsEditor({ initial }: Props) {
  const [groups, setGroups] = useState<SkillGroup[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(groups[0]?.id ?? null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newSkillNames, setNewSkillNames] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await addGroupAction(name);
      if (result.error) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      } else if (result.group) {
        setGroups((prev) => [...prev, result.group!]);
        setExpandedId(result.group.id);
        setNewGroupName("");
      }
    });
  };

  const handleRenameGroup = (id: string, name: string) => {
    startTransition(async () => {
      const result = await renameGroupAction(id, name);
      if (result.error) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  const handleDeleteGroup = (id: string) => {
    startTransition(async () => {
      const result = await deleteGroupAction(id);
      if (result.error) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      } else {
        setGroups((prev) => prev.filter((g) => g.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    });
  };

  const handleAddSkill = (groupId: string) => {
    const name = (newSkillNames[groupId] ?? "").trim();
    if (!name) return;
    startTransition(async () => {
      const result = await addSkillAction(groupId, name);
      if (result.error) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      } else if (result.skill) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, skills: [...g.skills, result.skill!] } : g
          )
        );
        setNewSkillNames((prev) => ({ ...prev, [groupId]: "" }));
      }
    });
  };

  const handleRemoveSkill = (groupId: string, skill: Skill) => {
    startTransition(async () => {
      const result = await removeSkillAction(groupId, skill.id);
      if (result.error) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      } else {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, skills: g.skills.filter((s) => s.id !== skill.id) }
              : g
          )
        );
      }
    });
  };

  const handleDragEnd = (groupId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const oldIndex = group.skills.findIndex((s) => s.id === active.id);
    const newIndex = group.skills.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(group.skills, oldIndex, newIndex);

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, skills: reordered } : g))
    );

    startTransition(async () => {
      const result = await reorderSkillsAction(groupId, reordered.map((s) => s.id));
      if (result.error) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">


      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 font-mono text-xs text-red-400">
          ✗ {error}
        </div>
      )}

      {/* Groups */}
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {groups.map((group) => {
            const isOpen = expandedId === group.id;
            return (
              <motion.div
                key={group.id}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden rounded-lg border border-border bg-surface"
              >
                {/* Group header */}
                <div
                  className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-surface/80"
                  onClick={() => setExpandedId(isOpen ? null : group.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[0.65rem] text-text-muted select-none">
                      {isOpen ? "▼" : "▶"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-text-primary">
                        {group.name || <span className="italic text-text-muted">Sans nom</span>}
                      </span>
                      {group.skills.length > 0 && (
                        <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[0.55rem] text-text-muted">
                          {group.skills.length} skill{group.skills.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                    disabled={isPending}
                    className="font-mono text-xs text-text-muted transition-colors hover:text-red-400 disabled:opacity-40"
                  >
                    Supprimer
                  </button>
                </div>

                {/* Expanded form */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-4 border-t border-border p-4">

                        {/* Rename group */}
                        <div className="flex flex-col gap-1.5">
                          <label className={labelCls}>NOM DU DOMAINE</label>
                          <input
                            className={inputCls}
                            defaultValue={group.name}
                            onBlur={(e) => {
                              const newName = e.target.value.trim();
                              if (newName && newName !== group.name) {
                                setGroups((prev) =>
                                  prev.map((g) => g.id === group.id ? { ...g, name: newName } : g)
                                );
                                handleRenameGroup(group.id, newName);
                              }
                            }}
                            placeholder="Backend, Mobile, Frontend…"
                          />
                          <p className={`${labelCls} normal-case tracking-normal`}>Sauvegardé automatiquement à la perte du focus</p>
                        </div>

                        {/* Skills list */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className={labelCls}>TECHNOLOGIES</label>
                            {group.skills.length > 1 && (
                              <span className="font-mono text-[0.55rem] text-text-muted">glisser pour réordonner</span>
                            )}
                          </div>
                          {group.skills.length > 0 ? (
                            mounted ? (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(group.id, e)}
                              >
                                <SortableContext
                                  items={group.skills.map((s) => s.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="flex flex-col gap-1">
                                    {group.skills.map((skill) => (
                                      <SortableSkill
                                        key={skill.id}
                                        skill={skill}
                                        isPending={isPending}
                                        onRemove={() => handleRemoveSkill(group.id, skill)}
                                      />
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {group.skills.map((skill) => (
                                  <SortableSkill
                                    key={skill.id}
                                    skill={skill}
                                    isPending={isPending}
                                    onRemove={() => handleRemoveSkill(group.id, skill)}
                                  />
                                ))}
                              </div>
                            )
                          ) : (
                            <p className="font-mono text-xs text-text-muted">Aucune technologie. Ajoutes-en une ci-dessous.</p>
                          )}

                          {/* Add skill input */}
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              className={inputCls}
                              value={newSkillNames[group.id] ?? ""}
                              onChange={(e) =>
                                setNewSkillNames((prev) => ({ ...prev, [group.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); handleAddSkill(group.id); }
                              }}
                              placeholder="Spring Boot, Docker…"
                            />
                            <button
                              onClick={() => handleAddSkill(group.id)}
                              disabled={isPending || !(newSkillNames[group.id] ?? "").trim()}
                              className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:bg-accent/15 disabled:opacity-40"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add group */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3">
        <input
          className={inputCls}
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddGroup(); } }}
          placeholder="Nouveau domaine (ex: Backend, DevOps…)"
        />
        <button
          onClick={handleAddGroup}
          disabled={isPending || !newGroupName.trim()}
          className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:bg-accent/15 disabled:opacity-40"
        >
          + Ajouter
        </button>
      </div>
    </div>
  );
}
