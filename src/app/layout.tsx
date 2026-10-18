import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteJsonLd } from "@/components/site-json-ld";
import { SITE } from "@/lib/site";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Editorial display serif for magazine-style headlines (paired with Poppins for UI/body).
// Only the weights actually used remain: 700/800 for headlines, 500 for the italic accent.
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} - ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  // Answer engines quote the publisher, so say who that is in machine-readable terms.
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "travel",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${SITE.name} — RSS` }],
    },
  },
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    locale: "en_PH",
    siteName: SITE.name,
    url: "/",
    // `images` is intentionally absent: `app/opengraph-image.tsx` generates a real
    // 1200×630 card and Next wires it up automatically. Setting it here would override
    // that with the logo, which crops badly in every social preview.
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} - ${SITE.tagline}`,
    description: SITE.description,
  },
  // `icons` is intentionally absent: `app/favicon.ico` and `app/apple-icon.png` are the
  // real brand mark and Next wires them up from the file convention. Setting it here
  // would override those.
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1726" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        <SiteJsonLd />
        {children}
      </body>
    </html>
  );
}
