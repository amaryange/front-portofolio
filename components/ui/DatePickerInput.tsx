"use client";

import "react-day-picker/style.css";
import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "react-day-picker/locale";

interface Props {
  value: string;           // YYYY-MM-DD ou ""
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}

function formatDisplay(value: string): string {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function toYMD(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const dpClassNames = {
  root: "!m-0",
  month_caption: "relative flex items-center justify-center py-1 mb-3",
  caption_label: "font-mono text-xs font-semibold text-text-primary capitalize",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous:
    "flex h-6 w-6 items-center justify-center rounded border border-border bg-surface text-text-muted transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent",
  button_next:
    "flex h-6 w-6 items-center justify-center rounded border border-border bg-surface text-text-muted transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "flex-1 pb-2 text-center font-mono text-[0.6rem] uppercase text-text-muted",
  week: "flex",
  day: "flex-1 flex items-center justify-center p-0.5",
  day_button:
    "h-7 w-7 rounded font-mono text-xs text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent",
  selected: "!bg-accent/20 !text-accent !font-semibold rounded",
  today: "!text-accent-warm !font-semibold",
  outside: "!opacity-25",
  disabled: "!opacity-20 !cursor-not-allowed",
};

function Chevron({ orientation }: { className?: string; size?: number; disabled?: boolean; orientation?: "left" | "right" | "up" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {orientation === "left"
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = "Choisir une date",
  disabled,
  clearable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = toDate(value);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (day: Date | undefined) => {
    if (!day) return;
    onChange(toYMD(day));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-bg px-3 py-2 font-mono text-sm outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? "border-accent/60 ring-1 ring-accent/30 text-text-primary"
            : "border-border text-text-primary hover:border-accent/40"
        }`}
      >
        <span className={value ? "text-text-primary" : "text-text-muted"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {clearable && value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onChange(""))}
              className="text-text-muted transition-colors hover:text-text-primary"
              aria-label="Effacer"
            >
              ×
            </span>
          )}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-surface p-4 shadow-2xl shadow-black/40">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            locale={fr}
            components={{ Chevron }}
            classNames={dpClassNames}
          />
        </div>
      )}
    </div>
  );
}
