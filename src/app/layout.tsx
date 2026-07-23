import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
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
  alternates: {
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
    images: [
      {
        url: "/tarabucket-full-logo.png",
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} - ${SITE.tagline}`,
    description: SITE.description,
    images: ["/tarabucket-full-logo.png"],
  },
  icons: { icon: "/tarabucket-square-logo-transparent.png" },
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
        {children}
      </body>
    </html>
  );
}
