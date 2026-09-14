import { ClubCard } from "@/components/cards/club-card";
import { Panel } from "@/components/fields";
import { ClubForm } from "@/components/forms/club-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { EmptyState, SectionHeading, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/auth";
import { listClubs } from "@/lib/data/clubs";

export const metadata = {
  title: "Clubs & societies",
};

export default async function ClubsPage() {
  const user = await getCurrentUser();
  const clubs = await listClubs(user?.id ?? null);

  const totalMembers = clubs.reduce((sum, club) => sum + club.member_count, 0);
  const myClubs = clubs.filter((club) => club.joined);
  const categories = Array.from(new Set(clubs.map((club) => club.category)));

  return (
    <PageShell>
      <PageHeader
        eyebrow="Clubs"
        title="Find your people"
        description="Every society on campus, from robotics to film. Join in one tap — and leave just as easily when exam season hits."
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Clubs" value={clubs.length} hint={`${categories.length} categories`} />
        <Stat label="Memberships" value={totalMembers} hint="across all clubs" />
        <Stat label="Your clubs" value={myClubs.length} hint="joined by you" />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section>
          <SectionHeading title="Club directory" description="Ordered by the number of members." />
          {clubs.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No clubs listed yet"
              description="Start the first one — you'll be the admin and anyone can join right away."
              action={
                <a href="#start" className="btn-primary btn-sm">
                  Register a club
                </a>
              }
            />
          )}
        </section>

        <aside id="start" className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Panel
            title="Start a club"
            description="You become the club admin automatically, and students can join straight away."
          >
            {user ? <ClubForm /> : <SignInPrompt message="Log in to register a club." />}
          </Panel>

          {myClubs.length > 0 ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-navy-900">Your memberships</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {myClubs.map((club) => (
                  <li key={club.id} className="flex items-center justify-between gap-3">
                    <span className="truncate">{club.name}</span>
                    <span className="chip shrink-0">{club.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}