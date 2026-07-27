"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storySubmissions, subscribers } from "@/db/schema";
import {
  canManagePost,
  getCurrentUser,
  getSession,
  requireAdmin,
  verifyCredentials,
} from "@/lib/auth";
import { createPost, deletePost, getPostById, updatePost } from "@/lib/posts";
import { postSchema } from "@/lib/validation";

type SaveResult = { ok: true; slug: string } | { ok: false; error: string };

/** Invalidate the public caches a post change can affect (ISR revalidation). */
function revalidateForPost(slug: string, category: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/category/${category}`);
  revalidatePath("/search");
  revalidatePath("/admin/posts");
}

// ── Auth ──────────────────────────────────────────────────────────

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const user = await verifyCredentials(email, password);
  if (!user) return { error: "Wrong email or password." };

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.role = user.role;
  await session.save();

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

// ── Posts ─────────────────────────────────────────────────────────

export async function savePost(
  id: string | null,
  input: unknown,
): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user?.userId) return { ok: false, error: "Not authenticated." };

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post." };
  }

  if (id) {
    // Only the author (or an admin) may edit an existing post.
    const existing = await getPostById(id);
    if (!existing) return { ok: false, error: "Post not found." };
    if (!canManagePost(user, existing)) {
      return { ok: false, error: "You can only edit your own posts." };
    }
  }

  const post = id
    ? await updatePost(id, parsed.data)
    : await createPost(parsed.data, user.userId);

  if (!post) return { ok: false, error: "Post not found." };

  revalidateForPost(post.slug, post.category);
  return { ok: true, slug: post.slug };
}

export async function deletePostAction(id: string) {
  const user = await getCurrentUser();
  if (!user?.userId) redirect("/admin/login");

  const existing = await getPostById(id);
  if (!existing) redirect("/admin/posts");
  // Only the author (or an admin) may delete a post.
  if (!canManagePost(user, existing)) redirect("/admin/posts");

  await deletePost(id);
  revalidateForPost(existing.slug, existing.category);
  redirect("/admin/posts");
}

// ── Submissions (admin-only management) ───────────────────────────

export async function setSubmissionStatus(id: string, status: string) {
  await requireAdmin();
  if (!["new", "published", "archived"].includes(status)) return;
  await db
    .update(storySubmissions)
    .set({ status })
    .where(eq(storySubmissions.id, id));
  revalidatePath("/admin/submissions");
  revalidatePath("/stories");
}

// ── Subscribers (admin-only management) ───────────────────────────

export async function deleteSubscriber(id: string) {
  await requireAdmin();
  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/subscribers");
}
