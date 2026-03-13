import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

export interface Post extends PostMeta {
  content: string;
}

function postsDir(locale: string) {
  return path.join(process.cwd(), "content/posts", locale);
}

export function getPostSlugs(locale: string): string[] {
  const dir = postsDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPost(slug: string, locale: string): Post {
  const filePath = path.join(postsDir(locale), `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    description: data.description as string,
    tags: (data.tags as string[]) ?? [],
    content,
  };
}

export function getAllPosts(locale: string): PostMeta[] {
  return getPostSlugs(locale)
    .map((slug) => getPost(slug, locale))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}
