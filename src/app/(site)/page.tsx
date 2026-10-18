import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  Reveal,
  RevealStagger,
  RevealItem,
  MagneticLink,
  Marquee,
} from "@/components/fx";
import { PostCard } from "@/components/post-card";
import { CoverImage } from "@/components/cover-image";
import { NewsletterForm } from "@/components/newsletter-form";
import { buttonClasses } from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { getFeaturedPosts, getPublishedPosts } from "@/lib/posts";

export const revalidate = 300;

const HERO_IMG =
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80";
const INDEX_IMG =
  "https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=1200&q=80";
const CTA_IMG =
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=80";

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
  const [featured, latest] = await Promise.all([
    getFeaturedPosts(1),
    getPublishedPosts({ limit: 6 }),
  ]);
  const lead = featured[0];

  return (
    <>
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
                {/* The quiz is the activation surface — a question converts a first-time
                    visitor far better than an instruction to start building something. */}
                <MagneticLink href="/quiz" className={buttonClasses("primary", "lg")}>
                  How many have you done? <ArrowRight size={18} />
                </MagneticLink>
                <Link
                  href="/bucket-list"
                  className="group inline-flex items-center gap-1.5 border-b-2 border-ink pb-0.5 font-semibold text-ink"
                >
                  Build a bucket list
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
                {/* The site's LCP element. `priority` emits the preload and skips lazy
                    loading; `fill` in the aspect box keeps the space reserved. */}
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <Image
                    src={HERO_IMG}
                    alt="A hidden lagoon in Palawan"
                    fill
                    priority
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
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
                <div className="relative aspect-[16/11] overflow-hidden">
                  {lead.coverImage && (
                    // alt="" on purpose: the headline beside it is the link text.
                    <CoverImage
                      src={lead.coverImage}
                      alt=""
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="transition-transform duration-[1200ms] ease-out group-hover:scale-105"
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

      {/* ── Categories index ── */}
      <section className="border-y border-line bg-cream/50">
        <div className="container-tara grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="kicker mb-6 text-orange">Start here</p>
              <h2 className="display text-4xl text-ink lg:text-5xl">Six ways to explore</h2>
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
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <Image
                    src={INDEX_IMG}
                    alt="Heritage streets of Vigan"
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
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

      {/* ── Latest stories (editorial grid) ── */}
      <section className="container-tara py-16 lg:py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="kicker mb-3 text-blue-dark">Fresh stories</p>
            <h2 className="display text-4xl text-ink lg:text-5xl">Latest from the islands</h2>
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
              {/* Decorative: the copy beside it carries the meaning, so alt stays empty. */}
              <Image
                src={CTA_IMG}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-90"
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
