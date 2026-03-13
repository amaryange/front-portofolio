"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED_ALL = ["video/mp4", "video/webm", "video/ogg", "image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_EXT_ALL = ".mp4,.webm,.ogv,.jpg,.jpeg,.png,.webp,.gif";
const ACCEPTED_EXT_IMAGES = ".jpg,.jpeg,.png,.webp,.gif";
const MAX_BYTES = 500 * 1024 * 1024; // 500 MB

type UploadState = "idle" | "uploading" | "done" | "error";

interface MediaUploaderProps {
  onInsert: (snippet: string) => void;
  onClose: () => void;
  /** "cover" = images seulement, retourne l'URL brute via onSelectCover */
  mode?: "insert" | "cover";
  onSelectCover?: (url: string) => void;
}

function buildSnippet(url: string, mimeType: string): string {
  if (mimeType.startsWith("video/")) {
    return `<VideoDemo src="${url}" title="demo" caption="" />`;
  }
  return `![image](${url})`;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

export default function MediaUploader({ onInsert, onClose, mode = "insert", onSelectCover }: MediaUploaderProps) {
  const isCoverMode = mode === "cover";
  const ACCEPTED = isCoverMode ? ACCEPTED_IMAGES : ACCEPTED_ALL;
  const ACCEPTED_EXT = isCoverMode ? ACCEPTED_EXT_IMAGES : ACCEPTED_EXT_ALL;

  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; filename: string; size: number; mimeType: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setError(isCoverMode
        ? `Type non supporté. Images acceptées : jpg, png, webp, gif`
        : `Type non supporté. Acceptés : mp4, webm, ogv, jpg, png, webp, gif`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Fichier trop lourd (max 500 MB). Taille : ${formatBytes(file.size)}`);
      return;
    }

    setError(null);
    setState("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const json = JSON.parse(xhr.responseText) as { data: typeof result };
        setResult(json.data);
        setState("done");
      } else {
        let msg = `Erreur ${xhr.status}`;
        try { msg = (JSON.parse(xhr.responseText) as { error?: string }).error ?? msg; } catch {}
        setError(msg);
        setState("error");
      }
    });

    xhr.addEventListener("error", () => {
      setError("Erreur réseau");
      setState("error");
    });

    xhr.send(formData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoverMode]);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    upload(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInsert = () => {
    if (!result) return;
    if (isCoverMode) {
      onSelectCover?.(result.url);
    } else {
      onInsert(buildSnippet(result.url, result.mimeType));
    }
    onClose();
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <p className="font-mono text-xs tracking-wider text-text-muted">{isCoverMode ? "// image de couverture" : "// insérer un média"}</p>
          <button onClick={onClose} className="text-text-muted transition-colors hover:text-text-primary" aria-label="Fermer">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">

            {/* ── Zone de dépôt ── */}
            {state === "idle" && (
              <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed p-10 transition-colors duration-200 ${
                    dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-accent/[0.02]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className={`h-10 w-10 transition-colors ${dragging ? "text-accent" : "text-text-muted"}`} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  <div className="text-center">
                    <p className="font-mono text-sm text-text-secondary">
                      Glisser un fichier ou <span className="text-accent">parcourir</span>
                    </p>
                    <p className="mt-1 font-mono text-xs text-text-muted">
                      {isCoverMode
                        ? "jpg · png · webp · gif — max 500 MB"
                        : "mp4 · webm · ogv · jpg · png · webp · gif — max 500 MB"}
                    </p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_EXT}
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>

                {error && (
                  <p className="mt-3 font-mono text-xs text-red-400">{error}</p>
                )}
              </motion.div>
            )}

            {/* ── Upload en cours ── */}
            {state === "uploading" && (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-ping rounded-full bg-accent" aria-hidden />
                  <p className="font-mono text-sm text-text-secondary">Upload en cours…</p>
                  <span className="ml-auto font-mono text-xs text-accent">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Succès ── */}
            {state === "done" && result && (
              <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-text-primary">{result.filename}</p>
                    <p className="mt-0.5 font-mono text-xs text-text-muted">{formatBytes(result.size)} · {result.mimeType}</p>
                  </div>
                </div>

                {isCoverMode ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.url} alt="Couverture" className="h-40 w-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <p className="font-mono text-[0.65rem] tracking-wider text-text-muted">SNIPPET MDX</p>
                    <code className="mt-1.5 block break-all font-mono text-xs text-accent">
                      {buildSnippet(result.url, result.mimeType)}
                    </code>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="rounded-lg border border-border px-4 py-2 font-mono text-xs text-text-muted transition-colors hover:border-accent/30 hover:text-text-secondary"
                  >
                    Nouveau fichier
                  </button>
                  <button
                    onClick={handleInsert}
                    className="flex-1 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-all hover:bg-accent/15 hover:border-accent/60"
                  >
                    {isCoverMode ? "Définir comme couverture →" : "Insérer dans l'article →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Erreur ── */}
            {state === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 py-2">
                <p className="font-mono text-sm text-red-400">{error}</p>
                <button
                  onClick={reset}
                  className="rounded-lg border border-border px-4 py-2 font-mono text-xs text-text-muted transition-colors hover:text-text-secondary"
                >
                  Réessayer
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
