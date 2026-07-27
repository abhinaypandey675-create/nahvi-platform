"use client";

import { useState } from "react";

export default function CareersPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        role: form.get("role"),
        message: form.get("message"),
      }),
    });
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold">Careers</h1>
      <p className="mt-2 text-ink-dim">
        We're not running open roles through a job board yet — reach out directly and tell us what you'd want to work on.
      </p>

      {status === "sent" ? (
        <p className="mt-8 font-mono text-sm text-cyan">Application received. We'll be in touch.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" required placeholder="Your name" className="field" />
            <input name="email" type="email" required placeholder="Email" className="field" />
          </div>
          <input name="role" required placeholder="Role you're interested in" className="field" />
          <textarea name="message" required rows={5} placeholder="Tell us about yourself" className="field" />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 font-mono text-sm font-medium text-bg disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Apply"}
          </button>
          {status === "error" && <p className="font-mono text-sm text-signal">Something went wrong.</p>}
          <style jsx>{`
            .field {
              width: 100%;
              border-radius: 0.75rem;
              border: 1px solid rgba(255, 255, 255, 0.1);
              background: rgba(255, 255, 255, 0.03);
              padding: 0.75rem 1rem;
              color: #e8ebfa;
              font-size: 0.875rem;
            }
            .field::placeholder {
              color: #565f85;
            }
          `}</style>
        </form>
      )}
    </div>
  );
}
