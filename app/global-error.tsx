"use client";

import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Client-side errors: report to the server so it can email the admin.
    // (Server-side errors already have direct access to lib/email.ts and
    // should call notify.productionError() from within their own catch blocks.)
    fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, stack: error.stack, route: window.location.pathname }),
    }).catch(() => {});
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-bg text-ink">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-ink-dim">The team has been notified.</p>
        </div>
      </body>
    </html>
  );
}
