import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/api/posts";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://amarycode.dev";
const locales = ["fr", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/fr`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/en`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/fr/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/en/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Articles de blog (toutes les locales)
  const postRoutes: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    try {
      const { data } = await getPosts({ locale, limit: 200 });
      for (const post of data) {
        postRoutes.push({
          url: `${BASE}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    } catch {
      // API indisponible — on omet les articles sans faire échouer le build
    }
  }

  return [...staticRoutes, ...postRoutes];
}
