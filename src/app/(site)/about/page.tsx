import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tara Bucket is a community journal for everyone chasing their Philippine bucket list.",
};

const VALUES = [
  {
    emoji: "🗺️",
    title: "Local first",
    body: "We write about the Philippines with respect for the people and places that make it worth the trip.",
  },
  {
    emoji: "🤝",
    title: "Community-powered",
    body: "The best tips come from real travelers. Your stories shape what we publish.",
  },
  {
    emoji: "🌱",
    title: "Travel that lasts",
    body: "We champion responsible travel so these places stay beautiful for the next generation.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-tara py-12">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-orange">
          Kumusta! 👋
        </p>
        <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          A journal for everyone chasing their{" "}
          <span className="text-blue-dark">Philippine bucket list</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Tara Bucket started with a simple belief: the Philippines has more
          worth-doing than any one lifetime can hold - and the best way to
          explore it is together. We collect the guides, deep-dives, and stories
          that turn a someday-list into a this-year plan.
        </p>
      </section>

      <section className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-3xl border border-line bg-white p-7 text-center"
          >
            <span className="text-4xl">{v.emoji}</span>
            <h2 className="mt-3 text-lg font-extrabold text-ink">{v.title}</h2>
            <p className="mt-2 text-sm text-muted">{v.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-4xl rounded-[2rem] bg-surface p-8 sm:p-12">
        <h2 className="text-2xl font-extrabold text-ink">What we cover</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-start gap-3">
              <span className="text-2xl">{c.emoji}</span>
              <div>
                <p className="font-bold text-ink">
                  {c.label}{" "}
                  <span className="font-normal text-faint">· {c.tagalog}</span>
                </p>
                <p className="text-sm text-muted">{c.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold text-ink">
          Got a story to tell?
        </h2>
        <p className="mt-3 text-muted">
          Whether it&apos;s your first island or your fiftieth, we&apos;d love to
          hear about it.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/stories#submit" size="lg">
            Share your story
          </ButtonLink>
          <ButtonLink href="/blog" variant="outline" size="lg">
            Start reading
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
