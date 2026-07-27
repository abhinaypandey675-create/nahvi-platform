import { NextRequest } from "next/server";
import type { RequestMeta } from "./email";

/**
 * Pulls IP / user-agent / country off an incoming request.
 * - IP: works behind Vercel/most proxies via x-forwarded-for.
 * - Country: Vercel sets x-vercel-ip-country automatically for free, no
 *   external geo-IP service needed. On other hosts this will just be blank
 *   unless you add a geo-IP lookup (e.g. ipapi.co) yourself.
 */
export function getRequestMeta(req: NextRequest): RequestMeta {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const userAgent = req.headers.get("user-agent") || undefined;
  const country = req.headers.get("x-vercel-ip-country") || undefined;

  return { ip, userAgent, country };
}
