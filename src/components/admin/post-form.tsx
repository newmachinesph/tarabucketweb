"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { ForwardRefEditor } from "@/components/editor/ForwardRefEditor";
import { CATEGORIES } from "@/lib/categories";
import type { Post } from "@/db/schema";
import { savePost, deletePostAction } from "@/app/admin/actions";

const input =
  "w-full rounded-xl border-2 border-line bg-white px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-blue";
const label = "mb-1.5 block text-sm font-semibold text-ink";

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [category, setCategory] = useState(post?.category ?? "travel");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [content, setContent] = useState(post?.content ?? "");
  const [error, setError] = useState("");

  function submit(status: "draft" | "published") {
    setError("");
    const payload = {
      title,
      slug: slug || undefined,
      excerpt,
      content: editorRef.current?.getMarkdown() ?? content,
      coverImage: coverImage || "",
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      featured,
    };
    startTransition(async () => {
      const res = await savePost(post?.id ?? null, payload);
      if (res.ok) router.push("/admin/posts");
      else setError(res.error);
    });
  }

  function onDelete() {
    if (!post) return;
    if (!confirm("Delete this post permanently?")) return;
    startTransition(() => deletePostAction(post.id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div className="space-y-5">
        <div>
          <label className={label}>Title</label>
          <input
            className={`${input} text-lg font-semibold`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="15 Bucket-List Islands in the Philippines"
          />
        </div>

        <div>
          <label className={label}>Excerpt</label>
          <textarea
            className={`${input} min-h-20 resize-y`}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A one or two sentence hook shown in cards and search."
          />
        </div>

        <div>
          <label className={label}>Content</label>
          <div className="overflow-hidden rounded-xl border-2 border-line bg-white">
            <ForwardRefEditor
              ref={editorRef}
              markdown={content}
              onChange={setContent}
            />
          </div>
          <p className="mt-1.5 text-xs text-faint">
            Rich editor - type normally, use the toolbar, or paste markdown.
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-5">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => submit("published")}
              disabled={pending || !title.trim()}
              className="rounded-full bg-orange py-3 font-semibold text-white transition-all hover:bg-orange-dark active:scale-95 disabled:opacity-50"
            >
              {pending
                ? "Saving…"
                : post?.status === "published"
                  ? "Update & keep live"
                  : "Publish"}
            </button>
            <button
              onClick={() => submit("draft")}
              disabled={pending || !title.trim()}
              className="rounded-full border-2 border-line py-2.5 font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50"
            >
              Save as draft
            </button>
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
              {error}
            </p>
          )}
          {post && (
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-dark hover:underline"
              >
                View post ↗
              </a>
              <button
                onClick={onDelete}
                disabled={pending}
                className="font-semibold text-red hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <div>
            <label className={label}>Category</label>
            <select
              className={input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Cover image URL</label>
            <input
              className={input}
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
            />
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt=""
                className="mt-2 aspect-video w-full rounded-lg object-cover"
              />
            )}
          </div>

          <div>
            <label className={label}>Tags (comma separated)</label>
            <input
              className={input}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="islands, palawan, beaches"
            />
          </div>

          <div>
            <label className={label}>Slug (optional)</label>
            <input
              className={input}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from title"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-orange"
            />
            <span className="text-sm font-semibold text-ink">
              Feature on homepage
            </span>
          </label>
        </div>
      </aside>
    </div>
  );
}
