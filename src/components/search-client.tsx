"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CategoryPill } from "./ui";
import type { SearchDoc } from "@/lib/posts";

export function SearchClient({ index }: { index: SearchDoc[] }) {
  const [q, setQ] = useState("");
  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "excerpt", weight: 1 },
          { name: "category", weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [index],
  );

  const query = q.trim();
  const results = query ? fuse.search(query).map((r) => r.item) : index;

  return (
    <div>
      <div className="relative">
        <Search
          size={20}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search islands, food, festivals…"
          aria-label="Search stories"
          className="w-full rounded-full border-2 border-line bg-white py-4 pl-14 pr-5 text-lg text-ink outline-none transition-colors placeholder:text-faint focus:border-blue"
        />
      </div>

      <p className="mt-4 text-sm text-faint">
        {query
          ? `${results.length} ${results.length === 1 ? "result" : "results"} for "${query}"`
          : `${index.length} stories to explore`}
      </p>

      <ul className="mt-6 divide-y divide-line">
        {results.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/blog/${doc.slug}`}
              className="group flex flex-col gap-2 py-5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CategoryPill categoryKey={doc.category} interactive={false} />
              </div>
              <h2 className="text-xl font-extrabold text-ink group-hover:text-blue-dark">
                {doc.title}
              </h2>
              <p className="text-muted line-clamp-2">{doc.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>

      {query && results.length === 0 && (
        <p className="py-10 text-center text-muted">
          No matches. Try another word - <em>beach</em>, <em>food</em>,{" "}
          <em>festival</em>?
        </p>
      )}
    </div>
  );
}
