import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-4xl font-semibold">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-2 font-mono text-xs text-ink-faint">
          {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      )}
      {/* contentMd is stored as markdown. Wire in a renderer (e.g. `marked` or
          `react-markdown`, both already common in this stack) if you want
          rich formatting -- left as plain text here to avoid pulling in an
          extra dependency you may not want. */}
      <div className="prose prose-invert mt-10 max-w-none whitespace-pre-line text-ink-dim">
        {post.contentMd}
      </div>
    </article>
  );
}
