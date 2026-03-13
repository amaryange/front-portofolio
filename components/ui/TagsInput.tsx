"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export default function TagsInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Ajouter un tag…",
}: TagsInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const showDrop = open && (filtered.length > 0 || input.trim().length > 0);
  const canCreate =
    input.trim().length > 0 &&
    !value.includes(input.trim()) &&
    !suggestions.some((s) => s.toLowerCase() === input.trim().toLowerCase());

  const add = useCallback(
    (tag: string) => {
      const t = tag.trim();
      if (t && !value.includes(t)) onChange([...value, t]);
      setInput("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) add(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Input area */}
      <div
        className="flex min-h-[38px] flex-wrap items-center gap-1.5 cursor-text rounded-lg border border-border bg-bg px-3 py-2 transition-colors duration-150 focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-xs text-accent"
          >
            {tag}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); remove(tag); }}
              className="leading-none opacity-60 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg"
          >
            {canCreate && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(input); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 font-mono text-sm text-text-secondary transition-colors hover:bg-accent/5 hover:text-accent"
              >
                <span className="text-accent font-bold">+</span>
                Créer &laquo;{input.trim()}&raquo;
              </button>
            )}
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(s); }}
                className="flex w-full items-center px-3 py-2.5 font-mono text-sm text-text-secondary transition-colors hover:bg-accent/5 hover:text-accent"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
