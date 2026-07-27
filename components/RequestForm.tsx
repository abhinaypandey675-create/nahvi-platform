"use client";

import { useState } from "react";

export default function RequestForm({ apps }: { apps: { id: string; name: string }[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const appId = form.get("appId") as string;
    const appName = apps.find((a) => a.id === appId)?.name || (form.get("customApp") as string) || undefined;

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        appId: appId || undefined,
        appName,
        budget: form.get("budget"),
        message: form.get("message"),
      }),
    });

    setStatus(res.ok ? "sent" : "error");
    if (res.ok) (e.target as HTMLFormElement).reset();
  }

  if (status === "sent") {
    return <p className="mt-6 font-mono text-sm text-cyan">Request sent. We'll be in touch soon.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className="input" />
        <input name="email" type="email" required placeholder="Email" className="input" />
      </div>
      <select name="appId" className="input">
        <option value="">General / custom project</option>
        {apps.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <input name="budget" placeholder="Budget range (optional)" className="input" />
      <textarea name="message" required rows={4} placeholder="What are you trying to build?" className="input" />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 font-mono text-sm font-medium text-bg disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send request"}
      </button>
      {status === "error" && <p className="font-mono text-sm text-signal">Something went wrong. Try again.</p>}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.75rem 1rem;
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
