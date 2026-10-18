import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/fx";
import { BridgeHunter } from "@/components/bridges/bridge-hunter";
import { HOLIDAYS_2027, formatDay } from "@/lib/holidays";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "2027 Philippine long weekends",
  description:
    "Every 2027 long weekend in the Philippines, and the exact leave days to file for each one — matched with destinations that are actually in season.",
  alternates: { canonical: "/long-weekends" },
  openGraph: {
    title: "Every 2027 Philippine long weekend",
    description:
      "File one day, get four. The 2027 holiday bridges, with destinations in season for each.",
    url: "/long-weekends",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How many long weekends are there in the Philippines in 2027?",
    a: "Counting stretches of three days or more, 2027 has several — and filing two leave days turns most of them into four- and five-day breaks. Holy Week is the standout: Maundy Thursday (25 March) and Good Friday (26 March) already give a four-day break, and three filed days extends it to nine.",
  },
  {
    q: "Which 2027 Philippine holidays fall on a weekend?",
    a: "Labor Day (1 May), Independence Day (12 June), and Ninoy Aquino Day (21 August) all fall on a Saturday in 2027, and Christmas Day falls on a Saturday too. Holidays landing on a weekend are sometimes moved to the nearest Monday by proclamation, which is why those dates aren't confirmed until Malacañang signs.",
  },
  {
    q: "Are 2027 Philippine holiday dates final?",
    a: "Only partly. Regular holidays like New Year's Day, Araw ng Kagitingan, Labor Day, Independence Day, National Heroes Day, Bonifacio Day, Christmas, and Rizal Day are fixed by law (RA 9492). Special non-working days — Chinese New Year, All Souls' Day, Christmas Eve, and the last day of the year — are declared by presidential proclamation, usually signed in the second half of the preceding year. This tool marks which is which.",
  },
  {
    q: "What is a holiday bridge?",
    a: "A bridge is a working day sitting between a holiday and a weekend. Filing leave for that one day connects them into a longer stretch — the classic 'file one, get four'. This tool finds every bridge in 2027 for the number of leave days you're willing to spend.",
  },
];

export default function LongWeekendsPage() {
  const base = SITE.url.replace(/\/$/, "");
  const confirmed = HOLIDAYS_2027.filter((h) => h.status === "law");
  const provisional = HOLIDAYS_2027.filter((h) => h.status !== "law");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        { "@type": "ListItem", position: 2, name: "2027 long weekends", item: `${base}/long-weekends` },
      ],
    },
  ];

  return (
    <div className="container-tara py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-3xl">
        <Reveal>
          <header className="mb-10">
            <p className="kicker mb-4 text-orange">Bridge hunter</p>
            <h1 className="display text-5xl text-ink sm:text-6xl">
              File one day, get <span className="display-italic text-orange">four</span>
            </h1>
            <p className="mt-5 text-lg text-muted text-pretty">
              Every 2027 long weekend in the Philippines, the exact days to file, and where to
              go while it&rsquo;s actually in season. Pick how much leave you can spare.
            </p>
          </header>
        </Reveal>

        <BridgeHunter />

        {/* The honesty section — this is what makes the tool trustworthy enough to share. */}
        <section className="mt-14 rounded-3xl border border-line bg-surface/60 p-6">
          <h2 className="text-lg font-extrabold text-ink">
            Which 2027 dates are actually confirmed?
          </h2>
          <p className="mt-2 text-sm text-muted text-pretty">
            Regular holidays are fixed by law and won&rsquo;t move. Special non-working days are
            declared by presidential proclamation — usually signed late in the preceding year —
            and can shift, including to lengthen a weekend. We mark the difference rather than
            blending them, because a plan built on an unconfirmed date is a filed leave day
            wasted.
          </p>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-green">
                Fixed by law
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                {confirmed.map((h) => (
                  <li key={h.date}>
                    <span className="font-semibold">{formatDay(h.date)}</span> — {h.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-orange">
                Awaiting proclamation
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                {provisional.map((h) => (
                  <li key={h.date}>
                    <span className="font-semibold">{formatDay(h.date)}</span> — {h.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 border-t border-line pt-4 text-xs text-faint">
            Holy Week dates follow Easter Sunday, 28 March 2027. Eid&rsquo;l Fitr and
            Eid&rsquo;l Adha are lunar and proclaimed only after moon sighting, so they
            aren&rsquo;t listed — we&rsquo;d rather omit them than print a date that&rsquo;s a
            day off.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="display text-3xl text-ink">Common questions</h2>
          <dl className="mt-6 divide-y divide-line border-t border-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-semibold text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-muted text-pretty">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-10 text-center text-sm text-faint">
          Got your dates?{" "}
          <Link
            href="/plan"
            className="font-semibold text-muted underline underline-offset-2 hover:text-orange"
          >
            Turn one into a day-by-day plan
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
