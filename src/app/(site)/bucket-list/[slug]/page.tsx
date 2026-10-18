import Link from "next/link";
import type { Metadata } from "next";
import { templateById } from "@/lib/bucket-templates";
import { BucketBoard } from "@/components/bucket/bucket-board";
import { CustomBoard } from "@/components/bucket/custom-board";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const t = templateById(slug);
  if (!t) return { title: "My Bucket List" };
  return {
    title: t.title,
    description: t.blurb,
    alternates: { canonical: `/bucket-list/${t.id}` },
  };
}

export default async function BoardPage({ params }: Params) {
  const { slug } = await params;
  const t = templateById(slug);

  return (
    <div className="container-tara py-12">
      <Link
        href="/bucket-list"
        className="text-sm font-semibold text-muted hover:text-orange"
      >
        ← All bucket lists
      </Link>

      {t ? (
        <>
          <div className="mx-auto mb-8 mt-4 max-w-md text-center">
            <p className="text-muted text-pretty">{t.blurb}</p>
            <p className="mt-1 text-sm text-faint">
              Tap items to tick them off, then share your card.
            </p>
          </div>
          <BucketBoard
            list={{
              id: t.id,
              title: t.title,
              emoji: t.emoji,
              tagalog: t.tagalog,
              accent: t.accent,
              blurb: t.blurb,
              items: t.items,
            }}
          />
        </>
      ) : (
        <div className="mt-6">
          <CustomBoard slug={slug} />
        </div>
      )}
    </div>
  );
}
