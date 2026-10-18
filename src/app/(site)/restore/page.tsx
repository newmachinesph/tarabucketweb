import { Suspense } from "react";
import type { Metadata } from "next";
import { RestoreClient } from "@/components/profile/restore-client";

export const metadata: Metadata = {
  title: "Restore your list",
  description: "Bring a saved Tara Bucket list back onto this device.",
  alternates: { canonical: "/restore" },
  // Personal data in the query string, and nothing here is useful to a searcher.
  robots: { index: false, follow: false },
};

export default function RestorePage() {
  return (
    <div className="container-tara py-16">
      <div className="mx-auto max-w-xl">
        <p className="kicker mb-4 text-orange">Backup</p>
        <h1 className="display mb-8 text-5xl text-ink">Restore your list</h1>
        {/* useSearchParams needs a Suspense boundary; the page is otherwise static. */}
        <Suspense fallback={<p className="text-muted">Reading your link&hellip;</p>}>
          <RestoreClient />
        </Suspense>
      </div>
    </div>
  );
}
