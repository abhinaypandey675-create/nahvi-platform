import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/email";
import { getRequestMeta } from "@/lib/request-meta";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  appId: z.string().optional(),
  appName: z.string().optional(), // free-text fallback (e.g. "Custom project")
  budget: z.string().optional(),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req);
  const { success } = await rateLimit(`request:${meta.ip ?? "unknown"}`, { limit: 10, windowSeconds: 3600 });
  if (!success) return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { name, email, appId, appName, budget, message } = parsed.data;

  const created = await prisma.appRequest.create({
    data: { name, email, budget, message, appId },
  });

  await notify.projectRequest({ name, email, app: appName, budget, message });
  if (appName) {
    await notify.appRequest({ appName, name, email });
  }

  return NextResponse.json({ ok: true, id: created.id });
}

// Admin: list all requests (for the dashboard's "recent requests" panel)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await prisma.appRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { app: { select: { name: true } } },
  });
  return NextResponse.json(requests);
}
