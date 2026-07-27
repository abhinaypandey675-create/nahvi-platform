import { prisma } from "@/lib/prisma";
import AdminAppRow from "@/components/AdminAppRow";
import AdminAppForm from "@/components/AdminAppForm";

export const dynamic = "force-dynamic";

export default async function AdminAppsPage() {
  const apps = await prisma.app.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Manage apps</h1>
      <p className="mt-2 text-ink-dim">No HTML editing required — add, edit, publish, and reorder from here.</p>

      <div className="mt-10 glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Add a new app</h2>
        <AdminAppForm />
      </div>

      <div className="mt-10 space-y-3">
        {apps.map((app) => (
          <AdminAppRow key={app.id} app={app} />
        ))}
        {apps.length === 0 && <p className="text-ink-faint">No apps yet — add one above.</p>}
      </div>
    </div>
  );
}
