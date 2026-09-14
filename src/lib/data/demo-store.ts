import {
  DEMO_USER_ID,
  demoAnswers,
  demoClubs,
  demoEvents,
  demoNotes,
  demoProfiles,
  demoQuestions,
  demoTeammatePosts,
} from "@/lib/data/demo-data";
import type { Answer, AppUser, CampusEvent, Club, Note, Profile, Question, TeammatePost } from "@/lib/types";

/**
 * In-memory database used in demo mode (no Supabase keys configured).
 * Mutations work for the lifetime of the server process, then reset.
 * Stored on `globalThis` so Turbopack's dev-time module reloads don't wipe it.
 */

export type DemoRsvp = { event_id: string; user_id: string };
export type DemoClubMember = { club_id: string; user_id: string };
export type DemoInterest = { post_id: string; user_id: string; message: string | null };

export type DemoDatabase = {
  profiles: Profile[];
  events: CampusEvent[];
  rsvps: DemoRsvp[];
  clubs: Club[];
  clubMembers: DemoClubMember[];
  teammatePosts: TeammatePost[];
  interests: DemoInterest[];
  notes: Note[];
  questions: Question[];
  answers: Answer[];
};

function seed(): DemoDatabase {
  const rsvps: DemoRsvp[] = [];
  const clubMembers: DemoClubMember[] = [];
  const interests: DemoInterest[] = [];

  for (const event of demoEvents) {
    for (let index = 0; index < event.rsvp_count; index += 1) {
      rsvps.push({ event_id: event.id, user_id: `guest-event-${index}` });
    }
    if (event.joined) rsvps.push({ event_id: event.id, user_id: DEMO_USER_ID });
  }

  for (const club of demoClubs) {
    for (let index = 0; index < club.member_count; index += 1) {
      clubMembers.push({ club_id: club.id, user_id: `guest-club-${index}` });
    }
    if (club.joined) clubMembers.push({ club_id: club.id, user_id: DEMO_USER_ID });
  }

  for (const post of demoTeammatePosts) {
    for (let index = 0; index < post.interest_count; index += 1) {
      interests.push({ post_id: post.id, user_id: `guest-post-${index}`, message: null });
    }
    if (post.interested) interests.push({ post_id: post.id, user_id: DEMO_USER_ID, message: null });
  }

  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

  return {
    profiles: clone(demoProfiles),
    events: clone(demoEvents),
    rsvps,
    clubs: clone(demoClubs),
    clubMembers,
    teammatePosts: clone(demoTeammatePosts),
    interests,
    notes: clone(demoNotes),
    questions: clone(demoQuestions),
    answers: clone(demoAnswers),
  };
}

const globalForDemo = globalThis as unknown as { __campusConnectDemo?: DemoDatabase };

export const demoDb: DemoDatabase = (globalForDemo.__campusConnectDemo ??= seed());

export function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/** The signed-in user in demo mode. */
export const DEMO_USER: AppUser = {
  id: DEMO_USER_ID,
  email: "demo@campusconnect.app",
  fullName: "Demo Student",
  username: "demo_student",
  avatarUrl: null,
};

export function demoProfileName(userId: string): string | null {
  return demoDb.profiles.find((profile) => profile.id === userId)?.full_name ?? null;
}
