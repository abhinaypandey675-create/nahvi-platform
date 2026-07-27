import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req);
  const { success } = await rateLimit(`forgot:${meta.ip ?? "unknown"}`, { limit: 5, windowSeconds: 3600 });
  if (!success) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  const { email } = await req.json().catch(() => ({ email: null }));
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (user && user.passwordHash) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: { identifier: `reset:${email}`, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "NAHVI <onboarding@resend.dev>",
        to: email,
        subject: "Reset your password",
        html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
