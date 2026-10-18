import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/posts";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <Link
        href="/admin/posts"
        className="text-sm font-semibold text-muted hover:text-orange"
      >
        ← Posts
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-ink">Edit post</h1>
      <PostForm post={post} />
    </div>
  );
}
