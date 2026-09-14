import Link from "next/link";

import { EventCard } from "@/components/cards/event-card";
import { SectionHeading, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/auth";
import { getCampusStats, listEvents } from "@/lib/data/events";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Campus Connect — one hub for campus life",
};

const FEATURES = [
  {
    href: "/events",
    emoji: "📅",
    title: "Campus events",
    body: "Post hackathons, workshops and fests with a capacity. Students RSVP in one tap and you watch the headcount fill up live.",
  },
  {
    href: "/clubs",
    emoji: "🎓",
    title: "Clubs & societies",
    body: "A directory of every club with live member counts. Join or leave instantly — or start your own club in 30 seconds.",
  },
  {
    href: "/teammates",
    emoji: "🤝",
    title: "Find teammates",
    body: "Post what your project needs — hackathon squad, study group, research partner — and let interested students reach out.",
  },
  {
    href: "/notes",
    emoji: "📝",
    title: "Shared notes",
    body: "Upload unit-wise PDFs to Supabase Storage, tag them by course and semester, and see how many people downloaded them.",
  },
  {
    href: "/qa",
    emoji: "❓",
    title: "Questions & answers",
    body: "Ask about internships, electives or exam prep. Seniors answer, and the question author accepts the best one.",
  },
  {
    href: "/profile",
    emoji: "🙋",
    title: "Your student profile",
    body: "Everything you contributed in one place: events you host, clubs you joined, notes and answers you shared.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const [stats, events] = await Promise.all([getCampusStats(), listEvents(user?.id ?? null)]);
  const upcoming = events.slice(0, 3);

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 sm:px-10 sm:py-16">
        <div aria-hidden className="absolute -top-28 -right-20 size-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="chip">Full-stack project · Next.js 16 · TypeScript · Tailwind · Supabase</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything your campus is doing, in one place.
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Campus Connect is the student hub for events, clubs, teammates, notes and questions — with real
            authentication, a Postgres database behind row-level security, and file uploads on every screen.
            {!isSupabaseConfigured
              ? " This instance runs in demo mode on seeded sample data so you can click through everything."
              : ""}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/events" className="btn-primary px-5 py-3">
              Explore campus activity
            </Link>
            {user ? (
              <Link href="/profile" className="btn-ghost px-5 py-3">
                Go to your profile
              </Link>
            ) : (
              <Link href="/signup" className="btn-ghost px-5 py-3">
                Create your account
              </Link>
            )}
            <Link href="/about" className="btn-ghost px-5 py-3">
              How it is built
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Events" value={stats.events} hint="posted by students" />
        <Stat label="RSVPs" value={stats.rsvps} hint="seats claimed" />
        <Stat label="Clubs" value={stats.clubs} hint="on the directory" />
        <Stat label="Notes shared" value={stats.notes} hint="study resources" />
      </section>

      <section>
        <SectionHeading
          title="What you can do here"
          description="Five connected features, each with its own database table, server actions and security rules."
          action={
            <Link href="/about" className="link text-sm">
              See the architecture →
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="card card-hover flex h-full flex-col gap-2 no-underline"
            >
              <span aria-hidden className="text-2xl">
                {feature.emoji}
              </span>
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          title="Happening soon"
          description="The next three events on campus — RSVP straight from the card."
          action={
            <Link href="/events" className="link text-sm">
              All events →
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} isOwner={user?.id === event.created_by} />
          ))}
        </div>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-5">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-white">Built as a portfolio-grade full-stack project</h2>
          <p className="mt-1 text-sm text-slate-400">
            React server components and server actions are the backend, Supabase Auth manages sessions, Postgres holds the
            data behind row-level security policies, and Supabase Storage serves the uploaded notes. Clone it, add two
            environment variables and it runs against your own Supabase project.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary px-5 py-3">
            Join campus
          </Link>
          <Link href="/about" className="btn-ghost px-5 py-3">
            Setup guide
          </Link>
        </div>
      </section>
    </div>
  );
}