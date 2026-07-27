import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RequestForm from "@/components/RequestForm";

export const dynamic = "force-dynamic";

export default async function AppDetailPage({ params }: { params: { slug: string } }) {
  const app = await prisma.app.findUnique({ where: { slug: params.slug } });
  if (!app || !app.published) notFound();

  const faqs = await prisma.faq.findMany({ where: { appId: app.id }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <span className="font-mono text-xs uppercase tracking-wider text-ink-dim">{app.category}</span>
      <h1 className="font-display mt-2 text-4xl font-semibold md:text-5xl">{app.name}</h1>
      {app.tagline && <p className="mt-4 text-lg text-ink-dim">{app.tagline}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {app.liveUrl && (
          <a href={app.liveUrl} className="rounded-full bg-gradient-to-r from-violet to-cyan px-5 py-2.5 font-mono text-sm font-medium text-bg">
            Live demo
          </a>
        )}
        {app.githubUrl && (
          <a href={app.githubUrl} className="rounded-full border border-white/15 px-5 py-2.5 font-mono text-sm">
            GitHub
          </a>
        )}
        {app.docsUrl && (
          <a href={app.docsUrl} className="rounded-full border border-white/15 px-5 py-2.5 font-mono text-sm">
            Documentation
          </a>
        )}
      </div>

      <div className="prose prose-invert mt-12 max-w-none">
        <p className="whitespace-pre-line text-ink-dim">{app.description}</p>
      </div>

      {(app.problem || app.solution) && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {app.problem && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-signal">Problem</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-dim">{app.problem}</p>
            </div>
          )}
          {app.solution && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-cyan">Solution</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-dim">{app.solution}</p>
            </div>
          )}
        </div>
      )}

      {app.technologies.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-lg font-semibold">Tech stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {app.technologies.map((t) => (
              <span key={t} className="rounded-md bg-white/5 px-3 py-1.5 font-mono text-xs text-ink-dim">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {app.screenshots.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {app.screenshots.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="rounded-xl border border-white/10" />
          ))}
        </div>
      )}

      {app.pricing && (
        <div className="mt-12 glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Pricing</h2>
          <p className="mt-2 text-ink-dim">{app.pricing}</p>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-lg font-semibold">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((f) => (
              <div key={f.id} className="border-b border-white/5 pb-4">
                <p className="font-medium">{f.question}</p>
                <p className="mt-1 text-sm text-ink-dim">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 glass rounded-2xl p-8">
        <h2 className="font-display text-2xl font-semibold">Interested in {app.name}?</h2>
        <RequestForm apps={[{ id: app.id, name: app.name }]} />
      </div>
    </div>
  );
}
