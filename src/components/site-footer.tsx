import Link from "next/link";
import { LogoMark } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { SITE } from "@/lib/site";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-tara grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
              <LogoMark size={26} />
            </span>
            <span className="text-xl font-extrabold">Tara Bucket</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            {SITE.tagline}. A community journal for everyone chasing their
            Philippine bucket list.
          </p>
          <div className="mt-5 flex gap-3">
            {SITE.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/20"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Explore">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link
                  href={`/category/${c.key}`}
                  className="text-sm text-white/75 transition-colors hover:text-orange"
                >
                  {c.emoji} {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Site">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">
            Tara Bucket
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li><Link href="/blog" className="hover:text-orange">Read stories</Link></li>
            <li><Link href="/destinations" className="hover:text-orange">Destinations</Link></li>
            <li><Link href="/bucket-list" className="hover:text-orange">Bucket lists</Link></li>
            <li><Link href="/stories#submit" className="hover:text-orange">Submit your story</Link></li>
            <li><Link href="/about" className="hover:text-orange">About us</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">
            The weekly bucket
          </h3>
          <p className="mt-4 text-sm text-white/60">
            One hand-picked Philippine adventure in your inbox, every week.
          </p>
          <div className="mt-4">
            <NewsletterForm compact />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-tara flex flex-col items-center justify-between gap-2 py-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Tara Bucket. Made in the Philippines 🇵🇭</p>
          <p>Tara na - let&apos;s go.</p>
        </div>
      </div>
    </footer>
  );
}
