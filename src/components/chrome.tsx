import Link from "next/link";

import { GITHUB_URL, isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

/** Amber banner shown when the app runs without Supabase credentials. */
export function DemoModeBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="border-b border-amber-400/20 bg-amber-500/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-xs text-amber-100">
        <span className="font-semibold">Demo mode</span>
        <span className="text-amber-200/80">
          No Supabase keys found, so the app runs on seeded sample data — writes stay in memory and file uploads are
          simulated. Add <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and a publishable key
          to <code className="rounded bg-black/30 px-1">.env.local</code> to switch on real auth, Postgres and Storage.
        </span>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-slate-200">Campus Connect</span> — built with Next.js, TypeScript, Tailwind
          CSS and Supabase.
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
    <span className={cn("flex items-center gap-2 font-semibold text-white", className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-sky-500 text-sm font-bold text-white">
        CC
      </span>
      Campus Connect
    </span>
  );
}