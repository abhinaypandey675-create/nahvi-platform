import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [totalApps, publishedApps, totalUsers, requests, recentLogins, recentRequests, topApps] =
    await Promise.all([
      prisma.app.count(),
      prisma.app.count({ where: { published: true } }),
      prisma.user.count(),
      prisma.appRequest.count(),
      prisma.loginEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.appRequest.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.app.findMany({ orderBy: { viewCount: "desc" }, take: 5, select: { name: true, viewCount: true } }),
    ]);

  const stats = [
    { label: "Apps", value: totalApps, sub: `${publishedApps} published` },
    { label: "Users", value: totalUsers },
    { label: "Requests", value: requests },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Admin dashboard</h1>
        <Link
          href="/admin/apps"
          className="rounded-full bg-gradient-to-r from-violet to-cyan px-5 py-2.5 font-mono text-sm font-medium text-bg"
        >
          Manage apps
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-dim">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
            {s.sub && <p className="mt-1 text-xs text-ink-faint">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Top viewed apps</h2>
          <ul className="mt-4 space-y-3">
            {topApps.map((a) => (
              <li key={a.name} className="flex justify-between text-sm">
                <span className="text-ink-dim">{a.name}</span>
                <span className="font-mono text-ink">{a.viewCount}</span>
              </li>
            ))}
            {topApps.length === 0 && <p className="text-sm text-ink-faint">No views yet.</p>}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Recent logins</h2>
          <ul className="mt-4 space-y-3">
            {recentLogins.map((l) => (
              <li key={l.id} className="text-sm">
                <span className="text-ink">{l.user.name || l.user.email}</span>{" "}
                <span className="text-ink-faint">
                  · {l.country || "—"} · {new Date(l.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
            {recentLogins.length === 0 && <p className="text-sm text-ink-faint">No logins yet.</p>}
          </ul>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Recent project requests</h2>
        <ul className="mt-4 space-y-4">
          {recentRequests.map((r) => (
            <li key={r.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <p className="text-sm text-ink">
                {r.name} <span className="text-ink-faint">— {r.email}</span>
              </p>
              <p className="mt-1 text-sm text-ink-dim">{r.message}</p>
              <p className="mt-1 font-mono text-xs text-ink-faint">{new Date(r.createdAt).toLocaleString()}</p>
            </li>
          ))}
          {recentRequests.length === 0 && <p className="text-sm text-ink-faint">No requests yet.</p>}
        </ul>
      </div>
    </div>
  );
}
