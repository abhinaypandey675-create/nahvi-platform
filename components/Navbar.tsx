"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          NAHVI
        </Link>

        <div className="hidden items-center gap-8 font-mono text-sm text-ink-dim md:flex">
          <Link href="/#apps" className="transition-colors hover:text-ink">
            Apps
          </Link>
          <Link href="/#about" className="transition-colors hover:text-ink">
            About
          </Link>
          <Link href="/blog" className="transition-colors hover:text-ink">
            Blog
          </Link>
          <Link href="/careers" className="transition-colors hover:text-ink">
            Careers
          </Link>
          <Link href="/#contact" className="transition-colors hover:text-ink">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              {session.user?.role === "ADMIN" && (
                <Link href="/admin" className="font-mono text-sm text-cyan hover:underline">
                  Admin
                </Link>
              )}
              <button onClick={() => signOut()} className="font-mono text-sm text-ink-dim hover:text-ink">
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-violet/30 bg-violet/10 px-4 py-2 font-mono text-sm text-ink transition-colors hover:bg-violet/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
