import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const app = await prisma.app.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fire-and-forget view counter -- don't block the response on it.
  prisma.app.update({ where: { id: app.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json(app);
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const app = await prisma.app.update({ where: { id: params.id }, data: body });
  return NextResponse.json(app);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.app.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
