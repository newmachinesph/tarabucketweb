import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/fx";
import { DESTINATIONS } from "@/lib/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Guides to the Philippine places worth putting on your bucket list, with galleries and quick facts.",
};

export default function DestinationsPage() {
  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mb-14 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">The gazetteer</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            Places worth the <span className="display-italic text-orange">flight</span>
          </h1>
          <p className="mt-5 text-lg text-muted">
            Field guides to the Philippine destinations that keep ending up on
            everyone&apos;s list. Galleries, quick facts, and the honest details.
          </p>
        </header>
      </Reveal>

      <RevealStagger className="grid gap-x-8 gap-y-14 md:grid-cols-2" gap={0.07}>
        {DESTINATIONS.map((d) => (
          <RevealItem key={d.slug}>
            <Link href={`/destinations/${d.slug}`} className="group block">
              <div className="aspect-[16/10] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.hero}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex items-start justify-between pt-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                    {d.region}
                  </span>
                  <h2 className="display mt-1.5 text-3xl text-ink">{d.name}</h2>
                  <p className="mt-1 max-w-sm text-muted">{d.tagline}</p>
                </div>
                <ArrowUpRight
                  size={22}
                  className="mt-1 shrink-0 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealStagger>
    </div>
  );
}
