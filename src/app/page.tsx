import Link from "next/link";

import { EventCard } from "@/components/cards/event-card";
import { CalendarIcon, NotesIcon, QuestionIcon, UserIcon, UserPlusIcon, UsersIcon } from "@/components/icons";
import { SectionHeading, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/auth";
import { getCampusStats, listEvents } from "@/lib/data/events";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Campus Connect — one hub for campus life",
};

// Icons instead of emoji illustrations: they inherit the text colour and stay
// visually quiet.
const FEATURES = [
  {
    href: "/events",
    icon: CalendarIcon,
    title: "Campus events",
    body: "Fests, workshops and club mixers with real seat counts. RSVP in one tap.",
  },
  {
    href: "/clubs",
    icon: UsersIcon,
    title: "Clubs & societies",
    body: "A directory of every club with live member counts. Join or leave anytime.",
  },
  {
    href: "/teammates",
    icon: UserPlusIcon,
    title: "Find teammates",
    body: "Hackathon squad, study group, research partner — post what you need.",
  },
  {
    href: "/notes",
    icon: NotesIcon,
    title: "Shared notes",
    body: "Unit-wise PDFs and past papers, tagged by course and free to download.",
  },
  {
    href: "/qa",
    icon: QuestionIcon,
    title: "Questions & answers",
    body: "Ask seniors about electives, internships or exam prep. Accept the best answer.",
  },
  {
    href: "/profile",
    icon: UserIcon,
    title: "Your profile",
    body: "Everything you've hosted, joined and shared, in one place.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const [stats, events] = await Promise.all([getCampusStats(), listEvents(user?.id ?? null)]);
  const upcoming = events.slice(0, 3);

  return (
    <div className="space-y-14">
      {/* Hero: flat navy block, no gradients or glow shapes. */}
      <section className="rounded-xl bg-navy-900 px-6 py-12 sm:px-10 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-meta font-medium text-accent-100">By students, for students</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-cream-50 sm:text-4xl">
            Everything your campus is doing, in one place.
          </h1>
          <p className="mt-4 text-body text-cream-100/85 sm:text-lg">
            Events, clubs, teammates, notes and answers to your questions — one login for all of it.
            {!isSupabaseConfigured
              ? " This instance runs on seeded sample data, so you can click through everything."
              : ""}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/events" className="btn-primary px-5 py-3">
              See what&apos;s on
            </Link>
            <Link
              href={user ? "/profile" : "/signup"}
              className="btn border border-cream-100/30 px-5 py-3 text-cream-50 hover:bg-navy-800"
            >
              {user ? "Go to your profile" : "Create your account"}
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
          description="Five features that actually get used during a semester."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="card card-hover flex h-full flex-col gap-2 no-underline"
            >
              <feature.icon className="size-5 text-accent-700" />
              <h3 className="text-base font-semibold text-navy-900">{feature.title}</h3>
              <p className="text-sm text-ink-muted">{feature.body}</p>
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
          <h2 className="text-lg font-semibold text-navy-900">Open source, and built to be read</h2>
          <p className="mt-1 text-sm text-ink-muted">
            The schema, security rules and every server action are checked into the repo. Clone it, add two environment
            variables and it runs against your own Supabase project.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary px-5 py-3">
            Join campus
          </Link>
          <Link href="/about" className="btn-quiet px-5 py-3">
            Setup guide
          </Link>
        </div>
      </section>
    </div>
  );
}