"use client";

import { useEffect } from "react";

/** Met à jour document.documentElement.lang après hydration. */
export default function LangUpdater({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
