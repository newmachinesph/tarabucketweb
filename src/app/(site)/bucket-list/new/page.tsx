import Link from "next/link";
import type { Metadata } from "next";
import { Builder } from "@/components/bucket/builder";

export const metadata: Metadata = {
  title: "Create a Bucket List",
  description: "Build your own Philippine bucket list. No sign-up needed.",
};

export default function NewBucketListPage() {
  return (
    <div className="container-tara py-12">
      <Link
        href="/bucket-list"
        className="text-sm font-semibold text-muted hover:text-orange"
      >
        ← All bucket lists
      </Link>
      <h1 className="mb-2 mt-3 text-4xl font-extrabold text-ink sm:text-5xl">
        Build your list
      </h1>
      <p className="mb-10 max-w-xl text-lg text-muted">
        Name it, pick a look, add your dreams. It saves to this device, no
        account needed.
      </p>
      <Builder />
    </div>
  );
}
