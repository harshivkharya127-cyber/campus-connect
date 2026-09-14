import { getSupabase } from "@/lib/data/client";
import { demoDb, demoProfileName, nextId } from "@/lib/data/demo-store";
import type { CampusEvent } from "@/lib/types";

export type EventInput = {
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  created_by: string;
  created_at: string;
  event_rsvps?: { user_id: string }[] | null;
  author?: { full_name: string | null } | null;
};

export async function listEvents(viewerId: string | null): Promise<CampusEvent[]> {
  const supabase = await getSupabase();

  if (!supabase) {
    return [...demoDb.events]
      .map((event) => withDemoCounts(event, viewerId))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }

  const { data, error } = await supabase
    .from("events")
    .select("*, event_rsvps(user_id), author:profiles!events_created_by_fkey(full_name)")
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);

  return (data as EventRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    capacity: row.capacity,
    created_by: row.created_by,
    created_at: row.created_at,
    author_name: row.author?.full_name ?? null,
    rsvp_count: row.event_rsvps?.length ?? 0,
    joined: Boolean(viewerId && row.event_rsvps?.some((rsvp) => rsvp.user_id === viewerId)),
  }));
}

function withDemoCounts(event: CampusEvent, viewerId: string | null): CampusEvent {
  const rows = demoDb.rsvps.filter((rsvp) => rsvp.event_id === event.id);
  return {
    ...event,
    author_name: demoProfileName(event.created_by),
    rsvp_count: rows.length,
    joined: Boolean(viewerId && rows.some((rsvp) => rsvp.user_id === viewerId)),
  };
}

export async function createEvent(input: EventInput, userId: string): Promise<string> {
  const supabase = await getSupabase();

  if (!supabase) {
    const id = nextId("event");
    demoDb.events.push({
      id,
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      capacity: input.capacity,
      created_by: userId,
      created_at: new Date().toISOString(),
      author_name: demoProfileName(userId),
      rsvp_count: 0,
      joined: false,
    });
    return id;
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      capacity: input.capacity,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

/** RSVP / cancel RSVP. Returns the resulting state. */
export async function toggleEventRsvp(eventId: string, userId: string): Promise<boolean> {
  const supabase = await getSupabase();

  if (!supabase) {
    const index = demoDb.rsvps.findIndex((rsvp) => rsvp.event_id === eventId && rsvp.user_id === userId);
    if (index >= 0) {
      demoDb.rsvps.splice(index, 1);
      return false;
    }
    demoDb.rsvps.push({ event_id: eventId, user_id: userId });
    return true;
  }

  const { data } = await supabase
    .from("event_rsvps")
    .select("event_id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    const { error } = await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: userId });
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteOwnEvent(eventId: string, userId: string): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    demoDb.events = demoDb.events.filter((event) => !(event.id === eventId && event.created_by === userId));
    demoDb.rsvps = demoDb.rsvps.filter((rsvp) => rsvp.event_id !== eventId);
    return;
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId).eq("created_by", userId);
  if (error) throw new Error(error.message);
}

/** Headline numbers for the events page (date maths lives here, not in a component). */
export async function getEventStats(
  viewerId: string | null,
): Promise<{ events: CampusEvent[]; upcoming: number; past: number; totalRsvps: number; attending: number }> {
  const events = await listEvents(viewerId);
  const now = Date.now();
  const upcoming = events.filter((event) => new Date(event.starts_at).getTime() >= now).length;

  return {
    events,
    upcoming,
    past: events.length - upcoming,
    totalRsvps: events.reduce((sum, event) => sum + event.rsvp_count, 0),
    attending: events.filter((event) => event.joined).length,
  };
}

/** Headline numbers for the landing page. */
export async function getCampusStats(): Promise<{
  events: number;
  clubs: number;
  notes: number;
  questions: number;
  teammates: number;
  rsvps: number;
}> {
  const supabase = await getSupabase();

  if (!supabase) {
    return {
      events: demoDb.events.length,
      clubs: demoDb.clubs.length,
      notes: demoDb.notes.length,
      questions: demoDb.questions.length,
      teammates: demoDb.teammatePosts.filter((post) => post.is_open).length,
      rsvps: demoDb.rsvps.length,
    };
  }

  const countOf = async (table: string) => {
    const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
    return count ?? 0;
  };

  const [events, clubs, notes, questions, teammates, rsvps] = await Promise.all([
    countOf("events"),
    countOf("clubs"),
    countOf("notes"),
    countOf("questions"),
    countOf("teammate_posts"),
    countOf("event_rsvps"),
  ]);

  return { events, clubs, notes, questions, teammates, rsvps };
}