import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold">Blog</h1>
      <p className="mt-2 text-ink-dim">Notes on shipping AI products.</p>

      <div className="mt-12 space-y-8">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="block border-b border-white/5 pb-8">
            <h2 className="font-display text-xl font-semibold">{p.title}</h2>
            {p.excerpt && <p className="mt-2 text-ink-dim">{p.excerpt}</p>}
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="text-ink-faint">
            No posts yet. Add one from{" "}
            <Link href="/admin" className="text-cyan hover:underline">
              the admin dashboard
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
