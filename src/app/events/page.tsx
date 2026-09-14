import Link from "next/link";

import { EventCard } from "@/components/cards/event-card";
import { Panel } from "@/components/fields";
import { EventForm } from "@/components/forms/event-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { EmptyState, SectionHeading, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/auth";
import { getEventStats } from "@/lib/data/events";

export const metadata = {
  title: "Campus events",
};

export default async function EventsPage() {
  const user = await getCurrentUser();
  const { events, upcoming, totalRsvps, attending } = await getEventStats(user?.id ?? null);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Events"
        title="What's happening on campus"
        description="Every event is stored in Postgres with its own RSVP table. Post one and watch the seat counter move as students tap RSVP."
        action={
          <Link href="#host" className="btn-primary px-5 py-3">
            Host an event
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Upcoming" value={upcoming} hint="scheduled events" />
        <Stat label="Seats claimed" value={totalRsvps} hint="across all events" />
        <Stat label="You're attending" value={attending} hint="your RSVPs" />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section>
          <SectionHeading
            title={upcoming > 0 ? "All events" : "Past events"}
            description="Sorted by start time, soonest first."
          />
          {events.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} isOwner={user?.id === event.created_by} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No events yet"
              description="Be the first to post something — a study jam, a hackathon team meetup, anything."
            />
          )}
        </section>

        <aside id="host" className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Panel
            title="Host an event"
            description="Add the details students need: what it is, where to show up and how many seats you have."
          >
            {user ? <EventForm /> : <SignInPrompt message="Log in to publish an event for your campus." />}
          </Panel>

          <div className="card">
            <h3 className="text-sm font-semibold text-white">How RSVPs work</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>• One row per student in `event_rsvps`, so counts stay exact.</li>
              <li>• Tapping RSVP again cancels it — no duplicate seats.</li>
              <li>• Authors can delete their own event; the cascade removes the RSVPs.</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}