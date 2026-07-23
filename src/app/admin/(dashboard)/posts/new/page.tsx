import Link from "next/link";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div>
      <Link
        href="/admin/posts"
        className="text-sm font-semibold text-muted hover:text-orange"
      >
        ← Posts
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-ink">New post</h1>
      <PostForm />
    </div>
  );
}
