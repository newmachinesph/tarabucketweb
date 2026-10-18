import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Any authenticated editor may enter the CMS; admin-only areas gate themselves.
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-surface">
      <AdminNav userName={user.name ?? "Editor"} />
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
