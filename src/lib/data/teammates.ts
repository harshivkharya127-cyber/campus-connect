import { getSupabase } from "@/lib/data/client";
import { demoDb, demoProfileName, nextId } from "@/lib/data/demo-store";
import type { TeammatePost } from "@/lib/types";

export type TeammatePostInput = {
  title: string;
  description: string | null;
  projectType: string;
  skills: string[];
  deadline: string | null;
  contactUrl: string | null;
};

type TeammateRow = {
  id: string;
  title: string;
  description: string | null;
  project_type: string;
  skills: string[] | null;
  deadline: string | null;
  contact_url: string | null;
  is_open: boolean;
  created_by: string;
  created_at: string;
  teammate_interests?: { user_id: string }[] | null;
  author?: { full_name: string | null } | null;
};

export async function listTeammatePosts(viewerId: string | null): Promise<TeammatePost[]> {
  const supabase = await getSupabase();

  if (!supabase) {
    return [...demoDb.teammatePosts]
      .map((post) => {
        const interests = demoDb.interests.filter((interest) => interest.post_id === post.id);
        return {
          ...post,
          author_name: demoProfileName(post.created_by),
          interest_count: interests.length,
          interested: Boolean(viewerId && interests.some((interest) => interest.user_id === viewerId)),
        };
      })
      .sort((a, b) => Number(b.is_open) - Number(a.is_open) || b.created_at.localeCompare(a.created_at));
  }

  const { data, error } = await supabase
    .from("teammate_posts")
    .select("*, teammate_interests(user_id), author:profiles!teammate_posts_created_by_fkey(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data as TeammateRow[])
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      project_type: row.project_type,
      skills: row.skills ?? [],
      deadline: row.deadline,
      contact_url: row.contact_url,
      is_open: row.is_open,
      created_by: row.created_by,
      created_at: row.created_at,
      author_name: row.author?.full_name ?? null,
      interest_count: row.teammate_interests?.length ?? 0,
      interested: Boolean(viewerId && row.teammate_interests?.some((interest) => interest.user_id === viewerId)),
    }))
    .sort((a, b) => Number(b.is_open) - Number(a.is_open) || b.created_at.localeCompare(a.created_at));
}

export async function createTeammatePost(input: TeammatePostInput, userId: string): Promise<string> {
  const supabase = await getSupabase();

  if (!supabase) {
    const id = nextId("team");
    demoDb.teammatePosts.unshift({
      id,
      title: input.title,
      description: input.description,
      project_type: input.projectType,
      skills: input.skills,
      deadline: input.deadline,
      contact_url: input.contactUrl,
      is_open: true,
      created_by: userId,
      created_at: new Date().toISOString(),
      author_name: demoProfileName(userId),
      interest_count: 0,
      interested: false,
    });
    return id;
  }

  const { data, error } = await supabase
    .from("teammate_posts")
    .insert({
      title: input.title,
      description: input.description,
      project_type: input.projectType,
      skills: input.skills,
      deadline: input.deadline,
      contact_url: input.contactUrl,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

/** "I'm interested" — sends a short note to the author. */
export async function expressInterest(postId: string, userId: string, message: string | null): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    const exists = demoDb.interests.some((interest) => interest.post_id === postId && interest.user_id === userId);
    if (!exists) demoDb.interests.push({ post_id: postId, user_id: userId, message });
    return;
  }

  const { error } = await supabase
    .from("teammate_interests")
    .upsert({ post_id: postId, user_id: userId, message }, { onConflict: "post_id,user_id" });
  if (error) throw new Error(error.message);
}

/** Author closes or reopens their post. */
export async function setTeammatePostOpen(postId: string, userId: string, isOpen: boolean): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    const post = demoDb.teammatePosts.find((row) => row.id === postId && row.created_by === userId);
    if (post) post.is_open = isOpen;
    return;
  }

  const { error } = await supabase
    .from("teammate_posts")
    .update({ is_open: isOpen })
    .eq("id", postId)
    .eq("created_by", userId);
  if (error) throw new Error(error.message);
}

export async function deleteTeammatePost(postId: string, userId: string): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    demoDb.teammatePosts = demoDb.teammatePosts.filter((post) => !(post.id === postId && post.created_by === userId));
    demoDb.interests = demoDb.interests.filter((interest) => interest.post_id !== postId);
    return;
  }

  const { error } = await supabase.from("teammate_posts").delete().eq("id", postId).eq("created_by", userId);
  if (error) throw new Error(error.message);
}