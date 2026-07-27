import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/email";
import { getRequestMeta } from "@/lib/request-meta";
import { rateLimit } from "@/lib/rate-limit";

// Intentionally unauthenticated -- any visitor's browser can hit this when
// the client-side error boundary fires. Rate-limited per IP so it can't be
// used to spam the admin inbox.
export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req);
  const { success } = await rateLimit(`error-report:${meta.ip ?? "unknown"}`, { limit: 20, windowSeconds: 3600 });
  if (!success) return NextResponse.json({ ok: false }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body?.message) return NextResponse.json({ ok: false }, { status: 400 });

  // Only run in production -- avoid noisy emails while developing locally.
  if (process.env.NODE_ENV === "production") {
    await notify.productionError({ message: body.message, route: body.route, stack: body.stack });
  }

  return NextResponse.json({ ok: true });
}
