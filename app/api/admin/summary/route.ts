import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Protected by middleware.ts (matches /api/admin/:path*)
export async function GET() {
  const [totalApps, publishedApps, totalUsers, requests, recentLogins, topApps] = await Promise.all([
    prisma.app.count(),
    prisma.app.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.appRequest.count(),
    prisma.loginEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.app.findMany({ orderBy: { viewCount: "desc" }, take: 5, select: { name: true, viewCount: true } }),
  ]);

  // Popular technologies, computed from the tags stored on each app.
  const apps = await prisma.app.findMany({ select: { technologies: true } });
  const techCounts: Record<string, number> = {};
  for (const a of apps) for (const t of a.technologies) techCounts[t] = (techCounts[t] || 0) + 1;
  const popularTechnologies = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    totalApps,
    publishedApps,
    totalUsers,
    totalRequests: requests,
    recentLogins,
    topApps,
    popularTechnologies,
  });
}
