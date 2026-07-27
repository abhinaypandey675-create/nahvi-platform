"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setStatus("sent"); // always show success -- don't leak which emails exist
  }

  if (status === "sent") {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-ink-dim">If an account exists for that address, a reset link is on its way.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-2xl font-semibold">Reset password</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 font-mono text-sm font-medium text-bg disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
