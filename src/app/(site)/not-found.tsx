import Link from "next/link";

// Branded 404 for the public site (replaces Next's bare default). Triggered by
// notFound() in dynamic routes and by unknown URLs.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <span className="text-6xl">🪣</span>
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange">
        404
      </p>
      <h1 className="mt-2 text-2xl font-extrabold text-ink">
        This one&apos;s not on the list yet
      </h1>
      <p className="mt-3 text-muted">
        The page you&apos;re looking for moved or never existed. Let&apos;s get you
        back on the trail.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-orange px-6 py-3 font-semibold text-white transition-all hover:bg-orange-dark active:scale-95"
        >
          Go home
        </Link>
        <Link
          href="/explore"
          className="rounded-full border-2 border-line px-6 py-3 font-semibold text-ink transition-colors hover:bg-surface"
        >
          Explore experiences
        </Link>
      </div>
    </div>
  );
}
