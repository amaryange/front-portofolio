"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

/* ── Page view tracker (doit être dans Suspense à cause de useSearchParams) ── */

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;
    let url = window.location.origin + pathname;
    if (searchParams.toString()) url += `?${searchParams.toString()}`;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

/* ── Provider principal ───────────────────────────────────────────────────── */

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NODE_ENV === "development") return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      ui_host: "https://us.posthog.com",

      // Page views gérées manuellement (App Router)
      capture_pageview: false,
      capture_pageleave: true,

      // Persiste les UTM params et le referrer entre les pages du site
      // → si quelqu'un vient de LinkedIn et navigue sur 3 pages,
      //   toutes les pages sont taguées utm_source=linkedin
      persistence: "localStorage",

      // Session replay
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },

      // Mode debug en développement
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
