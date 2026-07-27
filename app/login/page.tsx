"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Invalid email or password, or email not verified." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password, or email not verified.");
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-2xl font-semibold">Sign in</h1>
      {params.get("verified") && (
        <p className="mt-3 font-mono text-sm text-cyan">Email verified — you can sign in now.</p>
      )}

      <div className="mt-8 space-y-3">
        <button
          onClick={() => signIn("google")}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/25"
        >
          Continue with Google
        </button>
        <button
          onClick={() => signIn("github")}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/25"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-faint">
        <div className="h-px flex-1 bg-white/10" />
        or
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-ink-faint"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-ink-faint"
        />
        {error && <p className="font-mono text-sm text-signal">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 font-mono text-sm font-medium text-bg disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex justify-between text-sm text-ink-dim">
        <Link href="/forgot-password" className="hover:text-ink">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-ink">
          Create account
        </Link>
      </div>
    </div>
  );
}
