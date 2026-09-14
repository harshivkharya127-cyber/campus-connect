import Link from "next/link";

import { PageHeader, PageShell } from "@/components/page-header";
import { GITHUB_URL } from "@/lib/env";

export const metadata = {
  title: "How it is built",
};

const STACK = [
  { layer: "Frontend", tech: "Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4" },
  { layer: "Backend", tech: "React server components + server actions (no separate API server to deploy)" },
  { layer: "Database", tech: "Supabase Postgres with row-level security on every table" },
  { layer: "Auth", tech: "Supabase Auth (email + password), sessions in cookies, refreshed in proxy.ts" },
  { layer: "Storage", tech: "Supabase Storage bucket for note PDFs with owner-scoped policies" },
  { layer: "Deployment", tech: "Vercel (or any Node host) + a free Supabase project" },
];

const MAPPING = [
  { feature: "Campus events", tables: "events · event_rsvps", actions: "createEventAction · toggleRsvpAction · deleteEventAction" },
  { feature: "Clubs", tables: "clubs · club_members", actions: "createClubAction · toggleClubMembershipAction" },
  { feature: "Teammates", tables: "teammate_posts · teammate_interests", actions: "createTeammatePostAction · expressInterestAction" },
  { feature: "Notes", tables: "notes (+ Storage object)", actions: "uploadNoteAction · downloadNoteAction" },
  { feature: "Q&A", tables: "questions · answers", actions: "createQuestionAction · createAnswerAction · acceptAnswerAction" },
  { feature: "Profiles", tables: "profiles (auto-created by trigger)", actions: "updateProfileAction" },
];

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Architecture"
        title="How Campus Connect is built"
        description="A complete full-stack path: UI, server-side logic, relational data, authentication, file uploads and deployment — with the boring parts (migrations, policies, triggers) checked into the repo."
        action={
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost px-5 py-3">
            View source
          </a>
        }
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map((item) => (
          <div key={item.layer} className="card">
            <p className="text-xs font-semibold tracking-widest text-brand-300 uppercase">{item.layer}</p>
            <p className="mt-2 text-sm text-slate-300">{item.tech}</p>
          </div>
        ))}
      </section>

      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold text-white">Feature → data → server action</h2>
        <p className="mt-1 mb-4 text-sm text-slate-400">
          Every feature is a thin UI over its own tables, with validation living in a server action so the rules cannot be
          bypassed from the browser.
        </p>
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs tracking-widest text-slate-400 uppercase">
              <th className="py-2 pr-4 font-medium">Feature</th>
              <th className="py-2 pr-4 font-medium">Tables</th>
              <th className="py-2 font-medium">Server actions</th>
            </tr>
          </thead>
          <tbody>
            {MAPPING.map((row) => (
              <tr key={row.feature} className="border-b border-white/5 last:border-0">
                <td className="py-2.5 pr-4 font-medium text-slate-200">{row.feature}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-brand-200">{row.tables}</td>
                <td className="py-2.5 font-mono text-xs text-slate-400">{row.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-white">Security model</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>• Row-level security is <strong className="text-slate-200">enabled on every table</strong>; reads are public, writes are not.</li>
            <li>• Inserts and updates are restricted to <code className="font-mono text-xs">auth.uid() = created_by</code>.</li>
            <li>• Accepting an answer is allowed only for the student who asked the question.</li>
            <li>• Note downloads run through a <code className="font-mono text-xs">SECURITY DEFINER</code> RPC so anyone can bump the counter without update rights on the row.</li>
            <li>• Storage objects are written under a <code className="font-mono text-xs">{`{user_id}/`}</code> prefix and policies mirror the table rules.</li>
            <li>• Sessions live in cookies; <code className="font-mono text-xs">proxy.ts</code> refreshes them and the server verifies tokens with <code className="font-mono text-xs">getClaims()</code>.</li>
          </ul>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white">Request lifecycle</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-400">
            <li>1. A student submits a form — no client-side fetch code, just a React server action.</li>
            <li>2. The action re-validates every field on the server and redirects anonymous visitors to <code className="font-mono text-xs">/login</code>.</li>
            <li>3. The data layer (<code className="font-mono text-xs">src/lib/data/*</code>) writes through the Supabase client using the caller&apos;s cookie session, so RLS applies.</li>
            <li>4. <code className="font-mono text-xs">revalidatePath()</code> refreshes the affected pages; React streams the updated server components back.</li>
            <li>5. Without Supabase credentials the same data layer falls back to an in-memory demo store, so the UI never breaks.</li>
          </ol>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-white">Run it locally</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-400">
            <li>1. Install dependencies.</li>
          </ol>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-slate-300">{`npm install\nnpm run dev`}</pre>
          <p className="mt-3 text-sm text-slate-400">
            That is enough to explore every screen: with no environment variables the app boots in demo mode with a seeded
            campus.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white">Connect a real database</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-400">
            <li>1. Create a free project at supabase.com.</li>
            <li>2. Open the SQL editor and run <code className="font-mono text-xs">supabase/schema.sql</code>, then <code className="font-mono text-xs">supabase/seed.sql</code>.</li>
            <li>3. Copy <code className="font-mono text-xs">.env.example</code> to <code className="font-mono text-xs">.env.local</code> and paste the project URL + publishable key.</li>
            <li>4. Restart <code className="font-mono text-xs">npm run dev</code> — auth, uploads and persistence switch on automatically.</li>
          </ol>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-white">Deploy it</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Push this repository to GitHub, import it into Vercel, add the same two environment variables, and deploy. Because
          the backend lives in server actions and Supabase handles auth, data and storage, there is no separate server to
          host. Supabase also needs your deployed URL in <strong className="text-slate-200">Authentication → URL
          configuration</strong> so confirmation emails redirect back to <code className="font-mono text-xs">/auth/callback</code>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost px-5 py-3">
            Repository
          </a>
          <Link href="/events" className="btn-primary px-5 py-3">
            See it in action
          </Link>
        </div>
      </section>
    </PageShell>
  );
}