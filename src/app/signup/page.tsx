import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Create an account",
};

export default function SignUpPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Join your campus"
        description="One account for events, clubs, teammates, notes and questions. Your profile row is created automatically by a database trigger on sign-up."
      />

      <div className="mx-auto w-full max-w-md space-y-5">
        {isSupabaseConfigured ? (
          <AuthForm mode="signup" />
        ) : (
          <div className="card space-y-4 text-sm text-ink-muted">
            <h2 className="text-base font-semibold text-navy-900">Demo mode is active</h2>
            <p>
              Skip the form: this instance runs on seeded data and is already signed in as <strong>Demo Student</strong>.
            </p>
            <p>
              Add Supabase credentials to <code className="rounded bg-cream-200 px-1 font-mono text-xs">.env.local</code> to
              switch on real email + password sign-up and per-user data.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary px-4 py-2.5">
                Explore campus activity
              </Link>
              <Link href="/about" className="btn-quiet px-4 py-2.5">
                Setup guide
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}