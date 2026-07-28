import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/fx";
import { ButtonLink } from "@/components/ui";
import { PARTNERS, AFFILIATE_DISCLOSURE } from "@/lib/affiliates";

export const metadata: Metadata = {
  title: "Partners & affiliate disclosure",
  description:
    "How Tara Bucket makes money: affiliate commission from booking partners, never from selling trips ourselves. Who our partners are and what that means for you.",
  alternates: { canonical: "/partners" },
};

const KIND_LABEL = {
  tours: "Tours & activities",
  stays: "Places to stay",
  transport: "Getting around",
} as const;

export default function PartnersPage() {
  const byKind = (["tours", "stays", "transport"] as const).map((kind) => ({
    kind,
    partners: PARTNERS.filter((p) => p.kind === kind),
  }));

  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mx-auto max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">How this works</p>
          <h1 className="display text-5xl text-ink sm:text-6xl">
            We&rsquo;re not a <span className="display-italic text-orange">travel agency</span>
          </h1>
          <p className="mt-5 text-lg text-muted text-pretty">
            Tara Bucket is a journal, not a booking site. We don&rsquo;t sell trips, hold
            inventory, take your payment, or issue tickets &mdash; so we never have a
            reason to push you toward the option that pays us most.
          </p>
        </header>
      </Reveal>

      <div className="mx-auto max-w-3xl">
        <section className="prose-tara mt-10">
          <h2>How we make money</h2>
          <p>
            When we recommend an experience, we link out to companies that actually take
            bookings. If you book through one of those links, that company pays us a small
            commission. You pay the same price either way &mdash; the commission comes out
            of their margin, not your pocket.
          </p>
          <p>
            That&rsquo;s the entire business model. There is no markup, no service fee, and
            no upsell, because the transaction never touches us.
          </p>

          <h2>What that means for you</h2>
          <ul>
            <li>
              <strong>Your booking is with them, not us.</strong> Their terms, their
              cancellation policy, their customer service. If something goes wrong with a
              trip, they&rsquo;re who you contact.
            </li>
            <li>
              <strong>Commission never decides what we recommend.</strong> The catalog and
              the guides are built on what&rsquo;s worth doing. Partner links are added
              afterwards, to whatever we&rsquo;d have recommended anyway.
            </li>
            <li>
              <strong>We show you more than one option.</strong> Where several partners
              cover the same thing, you get the choice and a plain note on what each is
              good for.
            </li>
            <li>
              <strong>Affiliate links are marked.</strong> Every one carries a
              <code>sponsored</code> attribute and opens in a new tab, and every page
              carrying them says so.
            </li>
          </ul>

          <h2>Who we link to</h2>
        </section>

        <div className="mt-6 space-y-8">
          {byKind.map(({ kind, partners }) => (
            <section key={kind}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-faint">
                {KIND_LABEL[kind]}
              </h3>
              <ul className="space-y-2">
                {partners.map((p) => (
                  <li
                    key={p.key}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl border border-line bg-white px-4 py-3"
                  >
                    <span className="font-semibold text-ink">{p.name}</span>
                    <span className="text-sm text-muted">{p.strength}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="prose-tara mt-10">
          <h2>Questions we&rsquo;d rather answer up front</h2>
          <p>
            <strong>Do you get paid more for some recommendations?</strong> Commission
            rates differ between partners, yes. That&rsquo;s exactly why ranking is never
            based on them &mdash; partners are ordered by what suits the experience.
          </p>
          <p>
            <strong>Can a company pay to be in the catalog?</strong> No. If that ever
            changes, sponsored entries will be labelled as such, on the entry itself.
          </p>
          <p>
            <strong>What if I&rsquo;d rather not use an affiliate link?</strong> Go direct
            &mdash; search the partner yourself, or book with the operator. The
            recommendation is the same and it stays free either way.
          </p>
        </section>

        <div className="mt-10 rounded-3xl border border-line bg-surface p-6">
          <p className="text-sm text-muted">{AFFILIATE_DISCLOSURE}</p>
          <p className="mt-3 text-sm text-muted">
            Something here unclear, or a partner behaving badly?{" "}
            <Link href="/about" className="font-semibold text-orange hover:underline">
              Tell us
            </Link>{" "}
            &mdash; we&rsquo;ll drop a partner over it.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/plan" variant="primary">
            Plan a trip
          </ButtonLink>
          <ButtonLink href="/explore" variant="outline">
            Browse experiences
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
