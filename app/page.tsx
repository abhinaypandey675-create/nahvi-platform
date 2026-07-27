import { prisma } from "@/lib/prisma";
import AppCard from "@/components/AppCard";
import RequestForm from "@/components/RequestForm";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic"; // always reflect latest admin edits

export default async function HomePage() {
  const apps = await prisma.app.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex min-h-[80vh] flex-col items-start justify-center py-24">
        <span className="mb-6 rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-ink-dim">
          Building AI systems that ship
        </span>
        <h1 className="font-display max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
          Production AI, <span className="gradient-text">not demos</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-dim">
          NAHVI designs and ships intelligent agents, workflow engines, and developer tools —
          built for the systems that actually run in production.
        </p>
        <div className="mt-10 flex gap-4">
          <a
            href="#apps"
            className="rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 font-mono text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
          >
            View the apps
          </a>
          <a
            href="#contact"
            className="rounded-full border border-white/15 px-6 py-3 font-mono text-sm text-ink transition-colors hover:border-white/30"
          >
            Start a project
          </a>
        </div>
      </section>

      {/* App catalog */}
      <section id="apps" className="py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">The apps</h2>
            <p className="mt-2 text-ink-dim">Live products, in-progress builds, and experiments.</p>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-ink-dim">
            No apps published yet. Add one from the{" "}
            <a href="/admin/apps" className="text-cyan hover:underline">
              admin dashboard
            </a>
            .
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </section>

      {/* Request a project */}
      <section id="request" className="py-24">
        <div className="glass mx-auto max-w-2xl rounded-2xl p-8">
          <h2 className="font-display text-2xl font-semibold">Tell us what you're building</h2>
          <p className="mt-2 text-sm text-ink-dim">We'll follow up within one business day.</p>
          <RequestForm apps={apps.map((a) => ({ id: a.id, name: a.name }))} />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24">
        <div className="glass mx-auto max-w-2xl rounded-2xl p-8">
          <h2 className="font-display text-2xl font-semibold">Get in touch</h2>
          <p className="mt-2 text-sm text-ink-dim">General questions, partnerships, press.</p>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
