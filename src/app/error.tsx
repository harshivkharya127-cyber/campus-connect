"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. `reset()` re-renders the failed segment without
 * a full page reload, so a transient network blip doesn't lose the visitor.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The digest is what appears in server logs; print it so a report is traceable.
    console.error("Render error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="card mx-auto max-w-lg space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold text-navy-900">Something went wrong on our side</h1>
      <p className="text-sm text-ink-muted">
        This page failed to load. Your data is safe — nothing you submitted was lost. Try again, and if it keeps
        happening, let us know what you clicked.
      </p>
      {error.digest ? <p className="text-meta font-mono text-ink-muted/70">Ref: {error.digest}</p> : null}
      <div className="flex justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary px-5 py-2.5">
          Try again
        </button>
        <Link href="/" className="btn-quiet px-5 py-2.5">
          Back to home
        </Link>
      </div>
    </div>
  );
}