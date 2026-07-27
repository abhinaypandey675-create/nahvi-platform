"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAppForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const f = new FormData(e.currentTarget);

    const toList = (v: FormDataEntryValue | null) =>
      String(v || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const body = {
      name: f.get("name"),
      tagline: f.get("tagline") || undefined,
      description: f.get("description"),
      heroImage: f.get("heroImage") || undefined,
      status: f.get("status"),
      category: f.get("category") || undefined,
      tags: toList(f.get("tags")),
      technologies: toList(f.get("technologies")),
      pricing: f.get("pricing") || undefined,
      githubUrl: f.get("githubUrl") || undefined,
      liveUrl: f.get("liveUrl") || undefined,
      docsUrl: f.get("docsUrl") || undefined,
      featured: f.get("featured") === "on",
      published: f.get("published") === "on",
    };

    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setStatus("idle");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input name="name" required placeholder="Name" className="input" />
      <input name="tagline" placeholder="Tagline" className="input" />
      <textarea name="description" required placeholder="Description" className="input sm:col-span-2" rows={3} />
      <input name="heroImage" placeholder="Hero image URL" className="input" />
      <select name="status" defaultValue="BUILDING" className="input">
        <option value="LIVE">Live</option>
        <option value="BETA">Beta</option>
        <option value="BUILDING">Building</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <input name="category" placeholder="Category" className="input" />
      <input name="pricing" placeholder="Pricing (e.g. Free, $29/mo)" className="input" />
      <input name="tags" placeholder="Tags (comma separated)" className="input" />
      <input name="technologies" placeholder="Technologies (comma separated)" className="input" />
      <input name="githubUrl" placeholder="GitHub URL" className="input" />
      <input name="liveUrl" placeholder="Live demo URL" className="input" />
      <input name="docsUrl" placeholder="Docs URL" className="input sm:col-span-2" />

      <div className="flex items-center gap-6 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-ink-dim">
          <input type="checkbox" name="featured" /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-dim">
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
      </div>

      {error && <p className="font-mono text-sm text-signal sm:col-span-2">{error}</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-fit rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-2.5 font-mono text-sm font-medium text-bg disabled:opacity-50 sm:col-span-2"
      >
        {status === "saving" ? "Saving…" : "Add app"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.65rem 1rem;
          color: #e8ebfa;
          font-size: 0.875rem;
        }
        .input::placeholder {
          color: #565f85;
        }
      `}</style>
    </form>
  );
}
