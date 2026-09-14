import { redirect } from "next/navigation";

import { getSupabase, isSupabaseConfigured } from "@/lib/data/client";
import { DEMO_USER, demoDb } from "@/lib/data/demo-store";
import type { AppUser, Profile } from "@/lib/types";

/**
 * Reads the signed-in user.
 * - Supabase mode: verifies the access token with `getClaims()` (no extra network
 *   round-trip when the project uses asymmetric signing keys) and loads the profile.
 * - Demo mode: always returns the demo student so every screen is explorable.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured) return DEMO_USER;

  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const claims = data.claims as Record<string, unknown>;
  const id = typeof claims.sub === "string" ? claims.sub : null;
  if (!id) return null;

  const metadata = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const email = typeof claims.email === "string" ? claims.email : null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const row = profile as Profile | null;

  return {
    id,
    email,
    fullName:
      row?.full_name ??
      (typeof metadata.full_name === "string" ? metadata.full_name : null) ??
      email?.split("@")[0] ??
      "Student",
    username: row?.username ?? (typeof metadata.username === "string" ? metadata.username : null) ?? `user_${id.slice(0, 6)}`,
    avatarUrl: row?.avatar_url ?? null,
  };
}

/** Same as `getCurrentUser`, but bounces anonymous visitors to the login page. */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export type ProfileInput = {
  fullName: string;
  username: string;
  college: string | null;
  major: string | null;
  gradYear: number | null;
  bio: string | null;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await getSupabase();
  if (!supabase) return demoDb.profiles.find((profile) => profile.id === userId) ?? null;

  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function updateProfile(userId: string, input: ProfileInput): Promise<void> {
  const supabase = await getSupabase();
  if (!supabase) {
    const profile = demoDb.profiles.find((row) => row.id === userId);
    if (profile) {
      profile.full_name = input.fullName;
      profile.username = input.username;
      profile.college = input.college;
      profile.major = input.major;
      profile.grad_year = input.gradYear;
      profile.bio = input.bio;
    }
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      username: input.username,
      college: input.college,
      major: input.major,
      grad_year: input.gradYear,
      bio: input.bio,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

/** Content the signed-in user has contributed — shown on the profile page. */
export type MyActivity = {
  events: number;
  clubs: number;
  teammatePosts: number;
  notes: number;
  questions: number;
  answers: number;
};

export async function getMyActivity(userId: string): Promise<MyActivity> {
  const supabase = await getSupabase();
  if (!supabase) {
    return {
      events: demoDb.events.filter((row) => row.created_by === userId).length,
      clubs: demoDb.clubMembers.filter((row) => row.user_id === userId).length,
      teammatePosts: demoDb.teammatePosts.filter((row) => row.created_by === userId).length,
      notes: demoDb.notes.filter((row) => row.created_by === userId).length,
      questions: demoDb.questions.filter((row) => row.created_by === userId).length,
      answers: demoDb.answers.filter((row) => row.created_by === userId).length,
    };
  }

  const countFor = async (table: string, column: string) => {
    const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq(column, userId);
    return count ?? 0;
  };

  const [events, clubs, teammatePosts, notes, questions, answers] = await Promise.all([
    countFor("events", "created_by"),
    countFor("club_members", "user_id"),
    countFor("teammate_posts", "created_by"),
    countFor("notes", "created_by"),
    countFor("questions", "created_by"),
    countFor("answers", "created_by"),
  ]);

  return { events, clubs, teammatePosts, notes, questions, answers };
}