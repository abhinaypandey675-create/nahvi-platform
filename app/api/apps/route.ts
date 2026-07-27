import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import slugify from "slugify";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Public: list published apps, with optional filters (category/status/tech/featured).
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const featured = searchParams.get("featured");
  const tech = searchParams.get("technology") ?? undefined;

  const apps = await prisma.app.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(status ? { status: status as any } : {}),
      ...(featured ? { featured: featured === "true" } : {}),
      ...(tech ? { technologies: { has: tech } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(apps);
}

const appSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().min(1),
  problem: z.string().optional(),
  solution: z.string().optional(),
  heroImage: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  demoVideo: z.string().optional(),
  status: z.enum(["LIVE", "BUILDING", "BETA", "ARCHIVED"]).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  pricing: z.string().optional(),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  docsUrl: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

// Admin only: create an app.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = appSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const slug = slugify(parsed.data.name, { lower: true, strict: true });
  const app = await prisma.app.create({ data: { ...parsed.data, slug } });

  return NextResponse.json(app, { status: 201 });
}
