import Link from "next/link";

import { GITHUB_URL, isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

/** Caution strip shown when the app runs without Supabase credentials. */
export function DemoModeBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="border-b border-caution/25 bg-caution/5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-meta text-caution">
        <span className="font-semibold">Demo mode</span>
        <span className="text-caution/90">
          Running on seeded sample data — writes stay in memory. Add{" "}
          <code className="rounded bg-cream-200 px-1 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and a publishable key to{" "}
          <code className="rounded bg-cream-200 px-1 font-mono">.env.local</code> to switch on real auth, Postgres and
          Storage.
        </span>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-navy-900">Campus Connect</span> — built by students, for students.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/about" className="link">
            How it works
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="link">
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold text-navy-900", className)}>
      {/* Flat accent mark — one colour block, no gradient. */}
      <span aria-hidden className="grid size-8 place-items-center rounded-md bg-accent-600 text-sm font-bold text-white">
        CC
      </span>
      Campus Connect
    </span>
  );
}