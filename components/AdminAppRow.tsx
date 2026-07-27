"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { App } from "@prisma/client";

export default function AdminAppRow({ app }: { app: App }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(fields: Partial<App>) {
    setBusy(true);
    await fetch(`/api/apps/${app.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Delete "${app.name}"? This can't be undone.`)) return;
    setBusy(true);
    await fetch(`/api/apps/${app.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
      <div>
        <p className="font-display font-medium">{app.name}</p>
        <p className="font-mono text-xs text-ink-faint">
          {app.status} · {app.category || "uncategorized"} · {app.viewCount} views
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={busy}
          onClick={() => update({ published: !app.published })}
          className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
            app.published ? "border-emerald-400/30 text-emerald-300" : "border-white/15 text-ink-dim"
          }`}
        >
          {app.published ? "Published" : "Unpublished"}
        </button>
        <button
          disabled={busy}
          onClick={() => update({ featured: !app.featured })}
          className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
            app.featured ? "border-cyan/30 text-cyan" : "border-white/15 text-ink-dim"
          }`}
        >
          {app.featured ? "Featured" : "Not featured"}
        </button>
        <a href={`/apps/${app.slug}`} className="font-mono text-xs text-ink-dim hover:text-ink">
          View
        </a>
        <button disabled={busy} onClick={remove} className="font-mono text-xs text-signal hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}
