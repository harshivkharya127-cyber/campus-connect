import { ProfileForm } from "@/components/forms/profile-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { Avatar, Badge, SectionHeading, Stat } from "@/components/ui";
import { getMyActivity, getProfile, requireUser } from "@/lib/data/auth";
import { listClubs } from "@/lib/data/clubs";
import { listEvents } from "@/lib/data/events";
import { listNotes } from "@/lib/data/notes";
import { listQuestions } from "@/lib/data/qa";
import { listTeammatePosts } from "@/lib/data/teammates";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Your profile",
};

export default async function ProfilePage() {
  const user = await requireUser();

  const [profile, activity, events, clubs, notes, questions, posts] = await Promise.all([
    getProfile(user.id),
    getMyActivity(user.id),
    listEvents(user.id),
    listClubs(user.id),
    listNotes(),
    listQuestions(),
    listTeammatePosts(user.id),
  ]);

  const myEvents = events.filter((event) => event.created_by === user.id);
  const attending = events.filter((event) => event.joined);
  const myClubs = clubs.filter((club) => club.joined);
  const myNotes = notes.filter((note) => note.created_by === user.id);
  const myQuestions = questions.filter((question) => question.created_by === user.id);
  const myPosts = posts.filter((post) => post.created_by === user.id);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Profile"
        title="Your student profile"
        description="This is what other students see when you post an event, share notes or answer a question."
      />

      {!isSupabaseConfigured ? (
        <p className="rounded-md border border-caution/25 bg-caution/5 px-4 py-3 text-meta text-caution">
          You are signed in as the shared demo student. Connect Supabase to create real accounts and keep this profile
          between visits.
        </p>
      ) : null}

      <section className="card flex flex-wrap items-center gap-5">
        <Avatar name={user.fullName} className="size-16 text-lg" />
        <div className="min-w-48 flex-1">
          <h2 className="text-xl font-semibold text-navy-900">{user.fullName}</h2>
          <p className="text-sm text-ink-muted">
            @{user.username}
            {user.email ? ` · ${user.email}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile?.college ? <Badge>{profile.college}</Badge> : null}
            {profile?.major ? <Badge tone="accent">{profile.major}</Badge> : null}
            {profile?.grad_year ? <Badge tone="positive">Class of {profile.grad_year}</Badge> : null}
            <Badge>Joined {formatDate(profile?.created_at ?? new Date().toISOString())}</Badge>
          </div>
          {profile?.bio ? <p className="mt-3 max-w-2xl text-sm text-ink">{profile.bio}</p> : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Events hosted" value={activity.events} />
        <Stat label="Clubs joined" value={activity.clubs} />
        <Stat label="RSVPs" value={attending.length} />
        <Stat label="Posts" value={activity.teammatePosts} />
        <Stat label="Notes" value={activity.notes} />
        <Stat label="Answers" value={activity.answers} />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="card">
          <SectionHeading title="Edit profile" description="Updates are written straight to your Postgres row." />
          <ProfileForm
            fullName={user.fullName}
            username={user.username}
            college={profile?.college ?? null}
            major={profile?.major ?? null}
            gradYear={profile?.grad_year ?? null}
            bio={profile?.bio ?? null}
          />
        </section>

        <section className="space-y-5">
          <div className="card">
            <h3 className="text-sm font-semibold text-navy-900">Events you host</h3>
            {myEvents.length ? (
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {myEvents.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-3">
                    <span className="truncate">{event.title}</span>
                    <span className="chip shrink-0">{event.rsvp_count} going</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Nothing yet — host something from the events page.</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-navy-900">Clubs you joined</h3>
            {myClubs.length ? (
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {myClubs.map((club) => (
                  <li key={club.id} className="truncate">
                    {club.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Join a club to see it here.</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-navy-900">Your contributions</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              <li>{myNotes.length} notes shared</li>
              <li>{myPosts.length} teammate posts</li>
              <li>{myQuestions.length} questions asked</li>
            </ul>
          </div>
        </section>
      </div>
    </PageShell>
  );
}