import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Plus } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/fx";
import { MyLists } from "@/components/bucket/my-lists";
import { BUCKET_TEMPLATES } from "@/lib/bucket-templates";

export const metadata: Metadata = {
  alternates: { canonical: "/bucket-list" },
  title: "Bucket Lists",
  description:
    "Tick off ready-made Philippine bucket lists or build your own, then share it as an image. No sign-up.",
};

export default function BucketListPage() {
  return (
    <>
      <section className="container-tara pb-6 pt-14">
        <Reveal className="max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange">
            Interactive
          </p>
          <h1 className="text-5xl font-extrabold text-ink text-balance sm:text-6xl">
            Bucket-list flashcards
          </h1>
          <p className="mt-4 text-lg text-muted text-pretty">
            Tick off a ready-made list or build your own, then download it or
            share it to your socials. No account, no sign-up. Your progress saves
            right on your device.
          </p>
        </Reveal>
      </section>

      <section className="container-tara py-8">
        <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Create your own */}
          <RevealItem>
            <Link
              href="/bucket-list/new"
              className="group flex h-full min-h-[190px] flex-col justify-between rounded-3xl border-2 border-dashed border-ink/15 p-6 transition-colors hover:border-orange hover:bg-orange/5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange text-white">
                <Plus size={24} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-ink">Create your own</h2>
                <p className="mt-1 text-sm text-muted">
                  Build a custom bucket list from scratch.
                </p>
              </div>
            </Link>
          </RevealItem>

          {BUCKET_TEMPLATES.map((t) => (
            <RevealItem key={t.id}>
              <Link
                href={`/bucket-list/${t.id}`}
                className="group flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
                style={{ background: `linear-gradient(155deg, ${t.accent}1A, ${t.accent}08)` }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{t.emoji}</span>
                  <ArrowUpRight
                    size={20}
                    className="text-ink/30 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-ink">{t.title}</h2>
                  <p className="text-sm font-semibold" style={{ color: t.accent }}>
                    {t.tagalog}
                  </p>
                  <p className="mt-1.5 text-sm text-muted">
                    {t.items.length} to tick off
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      <MyLists />

      <div className="h-8" />
    </>
  );
}
