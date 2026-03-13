"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoDemoProps {
  src: string;
  title?: string;
  caption?: string;
  autoplay?: boolean;
  loop?: boolean;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const MuteIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const UnmuteIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

export function VideoDemo({
  src,
  title = "localhost:3000",
  caption,
  autoplay = false,
  loop = true,
}: VideoDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoplay);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    videoRef.current?.requestFullscreen();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  return (
    <figure className="my-8">
      <div
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-shadow duration-300 hover:shadow-[0_8px_48px_rgba(0,212,170,0.08)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Barre titre browser ── */}
        <div className="flex items-center gap-3 border-b border-border bg-bg px-4 py-3">
          {/* Dots macOS */}
          <div className="flex items-center gap-2" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>

          {/* URL bar */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              <span className="font-mono text-[0.65rem] tracking-wide text-text-muted">
                {title}
              </span>
            </div>
          </div>

          {/* Spacer symétrique */}
          <div className="w-[60px]" aria-hidden />
        </div>

        {/* ── Zone vidéo ── */}
        <div className="relative cursor-pointer bg-black" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={src}
            muted={muted}
            loop={loop}
            autoPlay={autoplay}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setPlaying(false)}
            className="w-full"
          />

          {/* Overlay play/pause central */}
          <AnimatePresence>
            {(!playing || hovered) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm"
                >
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Contrôles bas ── */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Barre de progression */}
                <div
                  className="group/progress mb-3 h-1 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleMute}
                    className="rounded p-1 text-white/70 transition-colors hover:text-white"
                    aria-label={muted ? "Activer le son" : "Couper le son"}
                  >
                    {muted ? <MuteIcon /> : <UnmuteIcon />}
                  </button>

                  <button
                    onClick={handleFullscreen}
                    className="rounded p-1 text-white/70 transition-colors hover:text-white"
                    aria-label="Plein écran"
                  >
                    <FullscreenIcon />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <figcaption className="mt-3 text-center font-mono text-xs text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
