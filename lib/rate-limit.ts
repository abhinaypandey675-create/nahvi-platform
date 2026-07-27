/**
 * Minimal fixed-window rate limiter.
 *
 * If UPSTASH_REDIS_REST_URL / TOKEN are set, uses Redis so limits are shared
 * across serverless instances (required on Vercel/production). Otherwise
 * falls back to an in-memory Map, which only works for a single-process dev
 * server or a traditional long-running Node server (Railway/Render).
 *
 * Set up Upstash (free tier) before relying on this in production on Vercel:
 * https://upstash.com
 */

const memoryStore = new Map<string, { count: number; resetAt: number }>();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function rateLimit(
  key: string,
  { limit = 5, windowSeconds = 60 }: { limit?: number; windowSeconds?: number } = {}
): Promise<{ success: boolean; remaining: number }> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    // Upstash REST "INCR" + "EXPIRE" pipeline
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", `rl:${key}`],
        ["EXPIRE", `rl:${key}`, windowSeconds.toString(), "NX"],
      ]),
    });
    const data = await res.json();
    const count = Number(data?.[0]?.result ?? 1);
    return { success: count <= limit, remaining: Math.max(0, limit - count) };
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1 };
  }
  entry.count += 1;
  return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}
