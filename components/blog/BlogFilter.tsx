"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { PostSummary } from "@/lib/api/posts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
function mediaSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

interface Props {
  posts: PostSummary[];
  locale: string;
  labelAll: string;
  labelEmpty: string;
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18, ease: "easeIn" } },
};

const filterContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const filterPill: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export default function BlogFilter({ posts, locale, labelAll, labelEmpty }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div>
      {/* Filtres */}
      <motion.div
        className="mb-10 flex flex-wrap gap-2"
        variants={filterContainer}
        initial="initial"
        animate="animate"
      >
        <motion.button
          variants={filterPill}
          onClick={() => setActiveTag(null)}
          className={`rounded-full border px-3.5 py-1.5 font-mono text-xs tracking-wider transition-colors duration-150 ${
            activeTag === null
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-text-muted hover:border-accent/50 hover:text-text-secondary"
          }`}
        >
          {labelAll}
        </motion.button>

        {allTags.map((tag) => (
          <motion.button
            key={tag}
            variants={filterPill}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-xs tracking-wider transition-colors duration-150 ${
              activeTag === tag
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-text-muted hover:border-accent/50 hover:text-text-secondary"
            }`}
          >
            {tag}
          </motion.button>
        ))}
      </motion.div>

      {/* Liste des posts */}
      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-sm text-text-muted"
        >
          {labelEmpty}
        </motion.p>
      ) : (
        <motion.ul layout className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((post) => {
              const date = post.publishedAt ?? post.createdAt;
              const cover = mediaSrc(post.coverImage);
              return (
                <motion.li
                  key={post.slug}
                  layout
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group block overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_24px_rgba(0,212,170,0.06)]"
                  >
                    {/* Cover image */}
                    {cover && (
                      <div className="overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover}
                          alt={post.title}
                          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <time className="font-mono text-xs tracking-wider text-text-muted">
                        {dateFormatter.format(new Date(date))}
                      </time>
                      <h2 className="mt-2 font-display text-xl font-bold text-text-primary transition-colors group-hover:text-accent">
                        {post.title}
                      </h2>
                      <p className="mt-2 font-mono text-sm leading-relaxed text-text-secondary">
                        {post.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-wider transition-colors duration-150 ${
                              tag === activeTag
                                ? "border-accent/50 text-accent"
                                : "border-border text-text-muted"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
