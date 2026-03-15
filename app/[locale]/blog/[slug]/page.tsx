import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import { getPost } from "@/lib/api/posts";
import { mdxComponents } from "@/components/blog/MDXComponents";
import ArticleTracker from "@/components/analytics/ArticleTracker";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const post = await getPost(slug, locale as "fr" | "en");
    return { title: post.title, description: post.description };
  } catch {
    return {};
  }
}

const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [[rehypeHighlight, { detect: true }]],
  },
};

async function MDXContent({ source }: { source: string }) {
  try {
    // compileMDX est un vrai await — les erreurs sont attrapables par try/catch,
    // contrairement à <MDXRemote /> qui retourne un élément React exécuté plus tard.
    const { content } = await compileMDX({
      source,
      // @ts-expect-error rehype-pretty-code type mismatch with next-mdx-remote
      options: mdxOptions,
      components: mdxComponents,
    });
    return <>{content}</>;
  } catch (err) {
    console.error("[MDXContent] compile error:", err);
    return (
      <p className="font-mono text-sm text-text-muted">
        Le contenu de cet article n&apos;a pas pu être affiché.
      </p>
    );
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const post = await getPost(slug, locale as "fr" | "en").catch(() => null);
  if (!post) notFound();

  const date = post.publishedAt ?? post.createdAt;
  const formattedDate = new Date(date).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
  const coverSrc = post.coverImage
    ? post.coverImage.startsWith("http") ? post.coverImage : `${API_BASE}${post.coverImage}`
    : null;

  return (
    <main className="min-h-screen pb-24 pt-32">
      <ArticleTracker slug={slug} locale={locale} title={post.title} />
      <article className="mx-auto max-w-[720px] px-6 md:px-8">
        {/* Back link */}
        <Link
          href={`/${locale}/blog`}
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-text-muted transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span>
          {locale === "fr" ? "Retour au blog" : "Back to blog"}
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <time className="font-mono text-xs tracking-wider text-text-muted">
              {formattedDate}
            </time>
            <span className="text-text-muted" aria-hidden>·</span>
            <div className="flex flex-wrap gap-2">
              {(post.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-wider text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 font-mono text-sm leading-relaxed text-text-secondary">
            {post.description}
          </p>
          <div className="mt-8 h-px w-full bg-border" />
        </header>

        {/* Cover image */}
        {coverSrc && (
          <div className="mb-12 overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverSrc}
              alt={post.title}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        )}

        {/* MDX content */}
        <div className="blog-prose">
          <MDXContent source={post.content} />
        </div>
      </article>
    </main>
  );
}
