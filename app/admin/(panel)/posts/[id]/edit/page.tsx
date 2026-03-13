import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api/server";
import { normalizeTags, type Post } from "@/lib/api/posts";
import type { PostFields } from "@/app/admin/(panel)/posts/actions";
import MDXEditor from "@/components/admin/MDXEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post: Post;
  try {
    const res = await serverFetch<{ data: Post }>(`/admin/posts/${id}`);
    post = { ...res.data, tags: normalizeTags(res.data.tags as never) };
  } catch {
    notFound();
  }

  const initialData: PostFields = {
    title:       post.title       ?? "",
    description: post.description ?? "",
    tags:        post.tags        ?? [],
    locale:      post.locale,
    content:     post.content     ?? "",
    coverImage:  post.coverImage  ?? null,
  };

  return <MDXEditor initialData={initialData} existingId={id} />;
}
