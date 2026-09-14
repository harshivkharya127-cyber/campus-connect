import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Log in",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Welcome back"
        description="Log in with your college email to RSVP to events, join clubs, upload notes and answer questions."
      />

      {error ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          That confirmation link could not be verified. Try logging in, or sign up again to get a fresh email.
        </p>
      ) : null}

      <div className="mx-auto w-full max-w-md space-y-5">
        {isSupabaseConfigured ? (
          <AuthForm mode="login" />
        ) : (
          <div className="card space-y-4 text-sm text-slate-400">
            <h2 className="text-base font-semibold text-white">Supabase is not connected yet</h2>
            <p>
              This instance is running in demo mode: you are already signed in as <strong>Demo Student</strong> and every
              feature works on seeded data.
            </p>
            <p>
              To enable real accounts, add <code className="rounded bg-black/40 px-1 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and a publishable key to <code className="rounded bg-black/40 px-1 font-mono text-xs">.env.local</code>, then
              run the SQL in <code className="rounded bg-black/40 px-1 font-mono text-xs">supabase/schema.sql</code>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary px-4 py-2.5">
                Continue in demo mode
              </Link>
              <Link href="/about" className="btn-ghost px-4 py-2.5">
                Read the setup guide
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}