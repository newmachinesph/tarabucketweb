import type { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { getSearchIndex } from "@/lib/posts";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/search" },
  title: "Search",
  description: "Search every story on Tara Bucket.",
};

export default async function SearchPage() {
  const index = await getSearchIndex();
  return (
    <div className="container-tara py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">Search</h1>
        <p className="mt-3 text-lg text-muted">
          Find your next Philippine adventure across the whole journal.
        </p>
      </header>
      <div className="mx-auto max-w-3xl">
        <SearchClient index={index} />
      </div>
    </div>
  );
}
