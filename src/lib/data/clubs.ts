import { getSupabase } from "@/lib/data/client";
import { demoDb, nextId } from "@/lib/data/demo-store";
import { slugify } from "@/lib/utils";
import type { Club } from "@/lib/types";

export type ClubInput = {
  name: string;
  description: string | null;
  category: string;
  contactEmail: string | null;
};

type ClubRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  contact_email: string | null;
  created_by: string;
  created_at: string;
  club_members?: { user_id: string }[] | null;
};

export async function listClubs(viewerId: string | null): Promise<Club[]> {
  const supabase = await getSupabase();

  if (!supabase) {
    return [...demoDb.clubs]
      .map((club) => {
        const members = demoDb.clubMembers.filter((member) => member.club_id === club.id);
        return {
          ...club,
          member_count: members.length,
          joined: Boolean(viewerId && members.some((member) => member.user_id === viewerId)),
        };
      })
      .sort((a, b) => b.member_count - a.member_count);
  }

  const { data, error } = await supabase
    .from("clubs")
    .select("*, club_members(user_id)")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  return (data as ClubRow[])
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      category: row.category,
      contact_email: row.contact_email,
      created_by: row.created_by,
      created_at: row.created_at,
      member_count: row.club_members?.length ?? 0,
      joined: Boolean(viewerId && row.club_members?.some((member) => member.user_id === viewerId)),
    }))
    .sort((a, b) => b.member_count - a.member_count);
}

export async function createClub(input: ClubInput, userId: string): Promise<string> {
  const supabase = await getSupabase();

  if (!supabase) {
    const id = nextId("club");
    demoDb.clubs.push({
      id,
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      category: input.category,
      contact_email: input.contactEmail,
      created_by: userId,
      created_at: new Date().toISOString(),
      member_count: 1,
      joined: true,
    });
    demoDb.clubMembers.push({ club_id: id, user_id: userId });
    return id;
  }

  const { data, error } = await supabase
    .from("clubs")
    .insert({
      name: input.name,
      slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`,
      description: input.description,
      category: input.category,
      contact_email: input.contactEmail,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const clubId = (data as { id: string }).id;
  const { error: memberError } = await supabase
    .from("club_members")
    .insert({ club_id: clubId, user_id: userId, role: "admin" });
  if (memberError) throw new Error(memberError.message);

  return clubId;
}

/** Join or leave a club. Returns the resulting membership state. */
export async function toggleClubMembership(clubId: string, userId: string): Promise<boolean> {
  const supabase = await getSupabase();

  if (!supabase) {
    const index = demoDb.clubMembers.findIndex((member) => member.club_id === clubId && member.user_id === userId);
    if (index >= 0) {
      demoDb.clubMembers.splice(index, 1);
      return false;
    }
    demoDb.clubMembers.push({ club_id: clubId, user_id: userId });
    return true;
  }

  const { data } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("club_id", clubId)
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    const { error } = await supabase.from("club_members").delete().eq("club_id", clubId).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase.from("club_members").insert({ club_id: clubId, user_id: userId });
  if (error) throw new Error(error.message);
  return true;
}