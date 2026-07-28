"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.get("email"),
        token: params.get("token"),
        password: form.get("password"),
      }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Reset link is invalid or expired.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-semibold">Password updated</h1>
        <p className="mt-3 text-ink-dim">
          <a href="/login" className="text-cyan hover:underline">
            Sign in
          </a>{" "}
          with your new password.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="New password (min. 8 characters)"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-ink-faint"
        />
        {error && <p className="font-mono text-sm text-signal">{error}</p>}
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 font-mono text-sm font-medium text-bg disabled:opacity-50"
        >
          {status === "sending" ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
