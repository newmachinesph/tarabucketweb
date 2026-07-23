import Link from "next/link";
import type { Metadata } from "next";
import { Reveal, RevealStagger, RevealItem } from "@/components/fx";
import { listCatalog } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/collections";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated ways into the Philippine bucket list — free adventures, weekend escapes, splurge-worthy trips, and more.",
};

export default async function CollectionsPage() {
  // Count each collection so the cards show how many experiences are inside.
  const counts = await Promise.all(
    COLLECTIONS.map((c) => listCatalog({ ...c.filters, pageSize: 1 }).then((r) => r.total)),
  );

  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mb-12 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">Curated</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            Collections
          </h1>
          <p className="mt-5 text-lg text-muted">
            Curated ways into the list — pick a vibe and start ticking.
          </p>
        </header>
      </Reveal>

      <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
        {COLLECTIONS.map((c, i) => (
          <RevealItem key={c.slug}>
            <Link
              href={`/collections/${c.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-4xl">{c.emoji}</span>
              <h2 className="display mt-4 text-2xl text-ink group-hover:text-orange">
                {c.title}
              </h2>
              <p className="mt-2 text-muted">{c.blurb}</p>
              <span className="mt-auto pt-4 text-sm font-semibold text-faint">
                {counts[i]} {counts[i] === 1 ? "experience" : "experiences"}
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealStagger>
    </div>
  );
}
