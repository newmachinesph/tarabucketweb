import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  Reveal,
  RevealStagger,
  RevealItem,
  MagneticLink,
  Marquee,
} from "@/components/fx";
import { PostCard } from "@/components/post-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { buttonClasses } from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import {
  getFeaturedPosts,
  getPublishedPosts,
  getCategoryCounts,
} from "@/lib/posts";

export const dynamic = "force-dynamic";

const HERO_IMG =
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80";
const INDEX_IMG =
  "https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=1200&q=80";

const PLACES = [
  "El Nido",
  "Siargao",
  "Batanes",
  "Sagada",
  "Coron",
  "Vigan",
  "Camiguin",
  "Bohol",
  "Ilocos",
  "Davao",
];

export default async function HomePage() {
  const [featured, latest, counts] = await Promise.all([
    getFeaturedPosts(1),
    getPublishedPosts({ limit: 6 }),
    getCategoryCounts(),
  ]);
  const lead = featured[0];

  return (
    <>
      {/* ── Masthead strip ── */}
      <div className="border-b border-line">
        <div className="container-tara flex items-center justify-between py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-faint">
          <span>The Philippine Bucket-List Journal</span>
          <span className="hidden sm:block">Est. 2026 · Manila</span>
          <span>Issue 01</span>
        </div>
      </div>

      {/* ── Cover hero ── */}
      <section className="container-tara pb-14 pt-10 lg:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="kicker text-orange">Field notes from 7,641 islands</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="display mt-6 text-[clamp(2.9rem,7.5vw,6.5rem)] text-ink">
                See the{" "}
                <span className="display-italic text-orange">whole</span> country
                before you settle.
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-muted text-pretty">
                Guides, deep-dives, and real stories for your Philippine bucket
                list. Islands, food, festivals, and everything worth the trip.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <MagneticLink href="/bucket-list" className={buttonClasses("primary", "lg")}>
                  Build a bucket list <ArrowRight size={18} />
                </MagneticLink>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-1.5 border-b-2 border-ink pb-0.5 font-semibold text-ink"
                >
                  Read the journal
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <figure>
                <div className="aspect-[4/5] overflow-hidden bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO_IMG}
                    alt="A hidden lagoon in Palawan"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-2.5 flex items-center justify-between text-xs font-medium text-faint">
                  <span>El Nido, Palawan</span>
                  <span className="uppercase tracking-widest">On the list</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Marquee (italic serif places) ── */}
      <section className="border-y border-line py-5">
        <Marquee
          items={PLACES.map((p) => (
            <span key={p} className="display-italic text-3xl text-ink/70 sm:text-4xl">
              {p}
              <span className="mx-7 not-italic text-orange">·</span>
            </span>
          ))}
        />
      </section>

      {/* ── Lead story ── */}
      {lead && (
        <section className="container-tara py-16 lg:py-24">
          <Reveal>
            <p className="kicker mb-8 text-blue-dark">The lead story</p>
            <Link href={`/blog/${lead.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="overflow-hidden bg-surface lg:col-span-7">
                <div className="aspect-[16/11] overflow-hidden">
                  {lead.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={lead.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center lg:col-span-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                  {CATEGORIES.find((c) => c.key === lead.category)?.label ?? lead.category}
                </span>
                <h2 className="display mt-3 text-4xl text-ink lg:text-5xl">
                  {lead.title}
                </h2>
                <p className="mt-4 text-lg text-muted text-pretty">{lead.excerpt}</p>
                <div className="mt-5 flex items-center gap-2 text-sm text-faint">
                  <span>{formatDate(lead.publishedAt)}</span>
                  <span aria-hidden>·</span>
                  <span>{lead.readingMinutes} min read</span>
                </div>
                <span className="mt-6 inline-flex w-fit items-center gap-2 border-b-2 border-ink pb-0.5 font-semibold text-ink">
                  Continue reading
                  <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ── In this issue (categories index) ── */}
      <section className="border-y border-line bg-cream/50">
        <div className="container-tara grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="kicker mb-6 text-orange">In this issue</p>
              <h2 className="display text-4xl text-ink lg:text-5xl">Six departments</h2>
            </Reveal>
            <RevealStagger className="mt-10">
              {CATEGORIES.map((c, i) => (
                <RevealItem key={c.key}>
                  <Link
                    href={`/category/${c.key}`}
                    className="group flex items-center gap-6 border-t border-line py-5 transition-colors last:border-b hover:bg-white"
                  >
                    <span className="display w-12 text-2xl text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="flex-1">
                      <h3 className="display text-2xl text-ink">{c.label}</h3>
                      <p className="text-sm text-muted">{c.blurb}</p>
                    </div>
                    <span className="hidden text-sm font-semibold text-faint sm:block">
                      {counts[c.key] ?? 0}
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="text-ink/30 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </Link>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <figure className="lg:sticky lg:top-28">
                <div className="aspect-[4/5] overflow-hidden bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={INDEX_IMG}
                    alt="Heritage streets of Vigan"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-2.5 text-xs font-medium text-faint">
                  Calle Crisologo, Vigan / Culture & Heritage
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The dispatch (latest, editorial grid) ── */}
      <section className="container-tara py-16 lg:py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="kicker mb-3 text-blue-dark">The dispatch</p>
            <h2 className="display text-4xl text-ink lg:text-5xl">Latest from the field</h2>
          </div>
          <Link href="/blog" className="group inline-flex items-center gap-1.5 border-b-2 border-ink pb-0.5 font-semibold text-ink">
            All stories
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {latest.length > 0 ? (
          <RevealStagger className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
            {latest.map((post) => (
              <RevealItem key={post.id}>
                <PostCard post={post} />
              </RevealItem>
            ))}
          </RevealStagger>
        ) : (
          <p className="text-muted">No stories yet.</p>
        )}
      </section>

      {/* ── Flashcards promo ── */}
      <section className="container-tara pb-16">
        <Reveal>
          <div className="grain relative grid overflow-hidden rounded-none bg-ink lg:grid-cols-2">
            <div className="flex flex-col justify-center gap-5 p-10 sm:p-14 lg:p-16">
              <p className="kicker text-orange">Interactive</p>
              <h2 className="display text-4xl text-white lg:text-5xl">
                Make your list. Tick it off. Share it.
              </h2>
              <p className="max-w-md text-white/70 text-pretty">
                Ready-made Philippine bucket lists you can check off, plus a
                builder for your own. Download the card or post it. No sign-up.
              </p>
              <div>
                <MagneticLink href="/bucket-list" className={buttonClasses("primary", "lg")}>
                  Open the flashcards <ArrowRight size={18} />
                </MagneticLink>
              </div>
            </div>
            <div className="relative min-h-[280px] overflow-hidden lg:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=80"
                alt=""
                className="h-full w-full object-cover opacity-90"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Newsletter ── */}
      <section className="border-t border-line">
        <div className="container-tara grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="kicker mb-4 text-orange">The weekly bucket</p>
            <h2 className="display text-4xl text-ink lg:text-5xl">
              One adventure, every week.
            </h2>
            <p className="mt-4 max-w-md text-muted text-pretty">
              A hand-picked Philippine story, guide, or hidden gem in your inbox.
              No spam, promise.
            </p>
          </div>
          <div className="lg:pl-10">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
