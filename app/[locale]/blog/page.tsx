import { getTranslations } from "next-intl/server";
import { getPosts } from "@/lib/api/posts";
import { routing } from "@/i18n/routing";
import BlogFilter from "@/components/blog/BlogFilter";
import type { PostSummary } from "@/lib/api/posts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  let posts: PostSummary[] = [];
  try {
    const res = await getPosts({ locale: locale as "fr" | "en", limit: 100 });
    posts = res.data;
  } catch {
    // L'API est indisponible — liste vide affichée
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-6 pb-24 pt-32 md:px-8">
      <div className="mb-16">
        <p className="mb-4 font-mono text-xs tracking-[0.2em] text-accent">
          {t("label")}
        </p>
        <h1 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-4 font-mono text-sm text-text-secondary">
          {t("subheading")}
        </p>
      </div>

      <BlogFilter
        posts={posts}
        locale={locale}
        labelAll={t("filterAll")}
        labelEmpty={t("empty")}
      />
    </main>
  );
}
