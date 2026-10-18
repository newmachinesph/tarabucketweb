import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarRange, MapPin, Plane, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { PostCard } from "@/components/post-card";
import { BookingPanel } from "@/components/affiliate/booking-panel";
import {
  DESTINATIONS,
  destinationAnswer,
  destinationBySlug,
  destinationFacts,
  destinationOgImage,
  type Destination,
} from "@/lib/destinations";
import { MONTHS } from "@/lib/planner-data";
import { CATEGORIES, categoryColor } from "@/lib/categories";
import { destinationAffiliateContext } from "@/lib/affiliates";
import { getPostsByTags } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

type Params = { params: Promise<{ slug: string }> };

const GROUP_TINT = { Luzon: "#14A3E1", Visayas: "#FF5A36", Mindanao: "#22C58B" } as const;

const SLOT_LABEL = {
  short: "A couple of hours",
  "half-day": "Half day",
  "full-day": "Full day",
} as const;

const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) return { title: "Not found" };
  // A real photo cropped to 1200×630 where we have one; otherwise the generated card in
  // `opengraph-image.tsx` takes over (explicit metadata wins over the file convention, so
  // leaving `images` unset is what hands control back to it).
  const og = destinationOgImage(d);

  return {
    title: `${d.name}, ${d.region}`,
    description: d.blurb,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: {
      title: `${d.name}, Philippines`,
      description: d.blurb,
      type: "article",
      url: `/destinations/${d.slug}`,
      ...(og ? { images: [{ url: og, width: 1200, height: 630, alt: d.name }] } : {}),
    },
    ...(og ? { twitter: { card: "summary_large_image" as const, images: [og] } } : {}),
  };
}

export default async function DestinationPage({ params }: Params) {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) notFound();

  const facts = destinationFacts(d);
  const tint = GROUP_TINT[d.islandGroup];
  const more = DESTINATIONS.filter((x) => x.slug !== slug && x.islandGroup === d.islandGroup)
    .concat(DESTINATIONS.filter((x) => x.islandGroup !== d.islandGroup))
    .slice(0, 3);
  const relatedPosts = await getPostsByTags(d.tags, 3);

  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    experiences: d.experiences.filter((e) => e.categoryKey === c.key),
  })).filter((g) => g.experiences.length > 0);

  const base = SITE.url.replace(/\/$/, "");
  const url = `${base}/destinations/${d.slug}`;
  const answer = destinationAnswer(d, facts);

  // Only the questions this page genuinely answers from data. A padded FAQ block is a
  // manual action risk, and an engine that quotes a hollow answer stops quoting us.
  const faqs = [
    { q: `When is the best time to visit ${d.name}?`, a: answer },
    {
      q: `How many days do you need in ${d.name}?`,
      a: `${d.suggestedDays} ${d.suggestedDays === 1 ? "day" : "days"} is what most travellers give ${d.name} before the returns start dropping off. We list ${facts.experienceCount} things to do there — ${facts.durationMix}.`,
    },
    {
      q: `How do you get to ${d.name}?`,
      a: d.gateway,
    },
    {
      q: `How much do things cost in ${d.name}?`,
      a:
        facts.costRange === "Free"
          ? `Every activity we list in ${d.name} is free.`
          : `Activities we list in ${d.name} run ${facts.costRange} per person${facts.freeCount > 0 ? `, and ${facts.freeCount} of the ${facts.experienceCount} are free` : ""}. These are rough per-person estimates for comparison, not quoted prices.`,
    },
  ];

  // Two graphs in one script: the place itself, plus the trail that earns breadcrumb
  // rich results instead of a bare URL in the SERP.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: `${d.name}, Philippines`,
      description: d.blurb,
      geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng },
      containedInPlace: { "@type": "AdministrativeArea", name: d.region },
      url,
      ...(d.hero ? { image: d.hero } : {}),
      touristType: d.tags,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        { "@type": "ListItem", position: 2, name: "Destinations", item: `${base}/destinations` },
        { "@type": "ListItem", position: 3, name: d.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <article className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — a real photo where we have one, else a tinted cover keyed to the island group.
          This is the LCP element: `priority` skips lazy-loading, `fill` inside a fixed-height
          box means the space is reserved before the bytes arrive (no layout shift). */}
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden bg-ink">
        {d.hero ? (
          <Image
            src={d.hero}
            alt={`${d.name}, ${d.region}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(135deg, #0E1726, ${tint})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
        <div className="container-tara absolute inset-x-0 bottom-0 pb-10">
          <p className="kicker flex items-center gap-2 text-white/80">
            <MapPin size={14} aria-hidden /> {d.region} · {d.islandGroup}
          </p>
          <h1 className="display mt-3 text-6xl text-white sm:text-7xl lg:text-8xl">
            {d.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85 text-pretty">{d.blurb}</p>
        </div>
      </div>

      <div className="container-tara py-12">
        {/* Visible trail matching the BreadcrumbList above — Google expects the markup to
            reflect something the reader can actually see and click. */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-muted">
            <li>
              <Link href="/" className="hover:text-orange">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-faint">
              /
            </li>
            <li>
              <Link href="/destinations" className="hover:text-orange">
                Destinations
              </Link>
            </li>
            <li aria-hidden className="text-faint">
              /
            </li>
            <li>
              <span aria-current="page" className="text-ink">
                {d.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          {/* Body */}
          <div className="lg:col-span-7">
            {/* The short factual answer, above the editorial prose. It's what a reader
                skims for and what an answer engine can quote without the page around it. */}
            <p className="border-l-2 border-orange/40 pl-4 text-lg font-medium text-muted text-pretty">
              {answer}
            </p>

            <div className="prose-tara mt-8">
              {d.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Best months. The filled/unfilled treatment is the visual cue; each chip also
                carries its status as text for screen readers, because a colour difference
                alone fails WCAG 1.4.1 and `title` is not reliably announced. */}
            <div className="mt-10">
              <p className="kicker mb-3 text-blue-dark">Best months</p>
              <ul className="flex flex-wrap gap-1.5" aria-label={`Best months to visit ${d.name}`}>
                {MONTHS.map((m, i) => {
                  const good = d.bestMonths.includes(i + 1);
                  return (
                    <li
                      key={m}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        good ? "bg-ink text-white" : "bg-surface text-faint"
                      }`}
                    >
                      <span aria-hidden>{m.slice(0, 3)}</span>
                      <span className="sr-only">
                        {good ? `${m}: good time to go` : `${m}: off-season`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-faint">Filled months are the good ones to go.</p>
            </div>

            {/* Experiences by category */}
            <div className="mt-12 space-y-10">
              <h2 className="display text-3xl text-ink">
                {facts.experienceCount} things to do
              </h2>
              {byCategory.map(({ category, experiences }) => (
                <section key={category.key}>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-ink">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: categoryColor(category.key) }}
                      aria-hidden
                    />
                    {category.label}
                  </h3>
                  <ul className="divide-y divide-line border-t border-line">
                    {experiences.map((e) => (
                      <li key={e.id} className="py-4">
                        <p className="font-semibold text-ink">{e.title}</p>
                        <p className="mt-0.5 text-sm text-muted text-pretty">{e.blurb}</p>
                        <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-faint">
                          <span>{SLOT_LABEL[e.slot]}</span>
                          <span aria-hidden>&middot;</span>
                          <span>{e.php === 0 ? "Free" : peso(e.php)}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            {/* Visible counterpart to the FAQPage schema — Google requires the marked-up
                answers to be on the page, and a reader wants them anyway. */}
            <section className="mt-12">
              <h2 className="display text-3xl text-ink">Common questions</h2>
              <dl className="mt-6 divide-y divide-line border-t border-line">
                {faqs.map((f) => (
                  <div key={f.q} className="py-5">
                    <dt className="font-semibold text-ink">{f.q}</dt>
                    <dd className="mt-1.5 text-muted text-pretty">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Affiliate hand-off — the same panel the experience pages use, so partner
                links, disclosure, and rel attributes have one home. */}
            <div className="mt-12">
              <BookingPanel context={destinationAffiliateContext(d.name)} heading="Book the pieces" />
            </div>
          </div>

          {/* Facts sidebar */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-3xl border border-line bg-cream/60 p-7">
                <p className="kicker mb-5 text-blue-dark">Quick facts</p>
                <dl className="divide-y divide-line">
                  <Fact label="Getting there" value={d.gateway} icon={<Plane size={15} />} />
                  <Fact label="Worth" value={`${d.suggestedDays} days`} icon={<CalendarRange size={15} />} />
                  <Fact label="Activity cost" value={facts.costRange} icon={<Wallet size={15} />} />
                  <Fact label="Mix" value={facts.durationMix} />
                  <Fact
                    label="Best months"
                    value={d.bestMonths.map((m) => MONTHS[m - 1]!.slice(0, 3)).join(", ")}
                  />
                </dl>
                <div className="mt-6 flex flex-col gap-2">
                  <ButtonLink
                    href={`/plan?destination=${d.slug}`}
                    variant="primary"
                    className="w-full"
                  >
                    Plan a trip here
                  </ButtonLink>
                  <ButtonLink href="/bucket-list" variant="outline" className="w-full">
                    Save to a bucket list
                  </ButtonLink>
                </div>
              </div>

              {d.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {d.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/tag/${t}`}
                      className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-blue/10 hover:text-blue-dark"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* From the journal */}
      {relatedPosts.length > 0 && (
        <section className="container-tara border-t border-line pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="display text-3xl text-ink">From the journal</h2>
            <Link href="/blog" className="text-sm font-semibold text-blue-dark hover:text-orange">
              All stories
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* Keep exploring */}
      <section className="container-tara border-t border-line pt-12">
        <h2 className="display mb-8 text-3xl text-ink">Keep exploring</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {more.map((m) => (
            <Link key={m.slug} href={`/destinations/${m.slug}`} className="group block">
              <div className="relative aspect-[16/11] overflow-hidden bg-surface">
                <MoreCover d={m} />
              </div>
              <span className="mt-3 block text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                {m.region}
              </span>
              <h3 className="display text-2xl text-ink group-hover:text-blue-dark">{m.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

function Fact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-faint">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function MoreCover({ d }: { d: Destination }) {
  if (d.hero) {
    return (
      <Image
        src={d.hero}
        alt={d.name}
        fill
        sizes="(min-width: 640px) 33vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }
  const tint = GROUP_TINT[d.islandGroup];
  return (
    <div
      className="grid h-full w-full place-items-center transition-transform duration-700 group-hover:scale-105"
      style={{ background: `linear-gradient(150deg, ${tint}26, ${tint}0d 60%, transparent)` }}
    >
      <span className="display text-3xl text-ink/80">{d.name}</span>
    </div>
  );
}
