import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  AFFILIATE_DISCLOSURE,
  PARTNER_LINK_REL,
  affiliateLinksFor,
  type AffiliateContext,
} from "@/lib/affiliates";

/**
 * Partner hand-off block. We don't sell anything — this points the reader at whoever
 * actually takes the booking. Rendered on the server; no client JS.
 *
 * Visually secondary to the recommendation above it, on purpose: the editorial call is
 * the product, and the moment partner links start looking like the point, the
 * credibility that earns the traffic goes with it.
 */
export function BookingPanel({
  context,
  heading = "Book it",
}: {
  context: AffiliateContext;
  heading?: string;
}) {
  const links = affiliateLinksFor(context);
  if (links.length === 0) return null;

  return (
    <section className="rounded-3xl border border-line bg-cream/50 p-6">
      <h2 className="text-lg font-extrabold text-ink">{heading}</h2>
      <p className="mt-1 text-sm text-muted">
        We don&rsquo;t take bookings ourselves. These search our partners for what&rsquo;s
        available near {context.place || context.province || context.region || "you"}.
      </p>

      <ul className="mt-5 space-y-2">
        {links.map(({ partner, href, label }) => (
          <li key={partner.key}>
            <a
              href={href}
              target="_blank"
              rel={PARTNER_LINK_REL}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-sm"
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink group-hover:text-orange">
                  {label}
                </span>
                <span className="block truncate text-xs text-faint">{partner.strength}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-muted">
                {partner.name}
                <ExternalLink size={14} aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-xs text-faint">
        {AFFILIATE_DISCLOSURE}{" "}
        <Link href="/partners" className="font-semibold text-muted underline underline-offset-2 hover:text-orange">
          How this works
        </Link>
      </p>
    </section>
  );
}
