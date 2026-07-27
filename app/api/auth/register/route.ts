import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/email";
import { getRequestMeta } from "@/lib/request-meta";
import { rateLimit } from "@/lib/rate-limit";
import { Resend } from "resend";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req);

  // Rate limit by IP: 5 signups per hour is plenty for a legitimate user,
  // and blunts basic automated account-creation abuse.
  const { success } = await rateLimit(`register:${meta.ip ?? "unknown"}`, {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Don't reveal which emails are registered -- generic success-shaped
    // response either way, but we simply don't create a duplicate account.
    return NextResponse.json({ ok: true });
  }

  // bcrypt with cost factor 12. Never store or email the raw password.
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // Email verification token, single-use, expires in 24h.
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
  if (resend) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "NAHVI <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      html: `<p>Welcome to NAHVI. Click below to verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
  }

  await notify.userRegistered({ name, email }, meta);

  return NextResponse.json({ ok: true });
}
