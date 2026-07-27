import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/email";
import { getRequestMeta } from "@/lib/request-meta";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  role: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req);
  const { success } = await rateLimit(`careers:${meta.ip ?? "unknown"}`, { limit: 10, windowSeconds: 3600 });
  if (!success) return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { name, email, role, message } = parsed.data;

  await prisma.contactMessage.create({
    data: { name, email, message: `[Application: ${role}]\n\n${message}` },
  });
  await notify.contactForm({ name, email, message: `Application for "${role}": ${message}` });

  return NextResponse.json({ ok: true });
}
