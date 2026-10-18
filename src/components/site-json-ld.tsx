import { SITE } from "@/lib/site";

/**
 * Site-wide structured data, emitted once from the root layout.
 *
 * Three things, and each earns its bytes:
 *  - `Organization` — tells search and answer engines who the publisher is. Answer engines
 *    attribute quotes to an entity; without this they have a domain and nothing else.
 *  - `WebSite` + `SearchAction` — the sitelinks searchbox, and it tells a crawler how to
 *    query the catalog directly instead of guessing URL shapes.
 *  - `sameAs` — the social profiles, which is how an engine reconciles "Tara Bucket" the
 *    site with "Tara Bucket" the accounts and stops treating them as separate entities.
 *
 * Per-page schema (Article, TouristDestination, BreadcrumbList) lives on the pages
 * themselves; this is only what's true everywhere.
 */
export function SiteJsonLd() {
  const base = SITE.url.replace(/\/$/, "");

  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: SITE.name,
      url: base,
      description: SITE.description,
      logo: {
        "@type": "ImageObject",
        url: `${base}/tarabucket-square-logo-transparent.png`,
      },
      sameAs: SITE.socials.map((s) => s.href),
      areaServed: { "@type": "Country", name: "Philippines" },
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en-PH",
      publisher: { "@id": `${base}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${base}/explore?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a stray sequence in the data can't close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
