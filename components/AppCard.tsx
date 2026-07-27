import Link from "next/link";
import Image from "next/image";

export type AppCardData = {
  slug: string;
  name: string;
  tagline?: string | null;
  heroImage?: string | null;
  status: string;
  category?: string | null;
  tags: string[];
  featured: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  LIVE: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  BETA: "bg-cyan/10 text-cyan border-cyan/30",
  BUILDING: "bg-violet/10 text-violet border-violet/30",
  ARCHIVED: "bg-ink-faint/10 text-ink-faint border-ink-faint/30",
};

export default function AppCard({ app }: { app: AppCardData }) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="card-hover glass group relative flex flex-col overflow-hidden rounded-2xl p-6"
    >
      {app.featured && (
        <span className="absolute right-4 top-4 rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan">
          Featured
        </span>
      )}

      {app.heroImage && (
        <div className="relative mb-5 h-36 w-full overflow-hidden rounded-xl bg-bg-soft">
          <Image src={app.heroImage} alt="" fill className="object-cover" />
        </div>
      )}

      <span
        className={`mb-3 w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
          STATUS_STYLES[app.status] ?? STATUS_STYLES.BUILDING
        }`}
      >
        {app.status}
      </span>

      <h3 className="font-display text-xl font-semibold text-ink">{app.name}</h3>
      {app.tagline && <p className="mt-2 text-sm leading-relaxed text-ink-dim">{app.tagline}</p>}

      {app.tags?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {app.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-ink-dim">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
