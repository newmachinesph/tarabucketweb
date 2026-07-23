import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { storySubmissions } from "@/db/schema";
import { StoryForm } from "@/components/story-form";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Stories",
  description:
    "Real Philippine bucket-list stories from the Tara Bucket community - and a place to share yours.",
};

export default async function StoriesPage() {
  const stories = await db
    .select()
    .from(storySubmissions)
    .where(eq(storySubmissions.status, "published"))
    .orderBy(desc(storySubmissions.createdAt));

  return (
    <div className="container-tara py-12">
      <header className="mb-12 max-w-2xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-orange">
          From the community
        </p>
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
          Bucket-list stories, told by you
        </h1>
        <p className="mt-3 text-lg text-muted">
          The best part of a bucket list isn&apos;t the checkmark - it&apos;s the
          story behind it. Here are a few from the community.
        </p>
      </header>

      {stories.length > 0 ? (
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {stories.map((s) => (
            <article
              key={s.id}
              className="rounded-3xl border border-line bg-white p-7 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-blue/10 text-lg font-extrabold text-blue-dark">
                  {s.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-bold text-ink">{s.name}</p>
                  <p className="text-sm text-faint">
                    {s.location || "Philippines"} · {timeAgo(s.createdAt)}
                  </p>
                </div>
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-ink">{s.title}</h2>
              <p className="mt-2 whitespace-pre-line text-muted">{s.story}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mb-16 rounded-3xl bg-surface p-10 text-center text-muted">
          No community stories published yet - be the first below! 👇
        </div>
      )}

      {/* Submit */}
      <section id="submit" className="scroll-mt-24">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-line bg-cream p-8 sm:p-12">
          <span className="text-4xl">✍️</span>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">
            Share your story
          </h2>
          <p className="mt-2 text-muted">
            Tell us what you ticked off your Philippine bucket list. We review
            every submission and feature the best ones here.
          </p>
          <div className="mt-8">
            <StoryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
