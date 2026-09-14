import { getSupabase } from "@/lib/data/client";
import { demoDb, demoProfileName, nextId } from "@/lib/data/demo-store";
import { NOTE_BUCKET } from "@/lib/env";
import type { Note } from "@/lib/types";

export type NoteInput = {
  title: string;
  description: string | null;
  subject: string;
  courseCode: string | null;
  semester: string | null;
};

type NoteRow = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  course_code: string | null;
  semester: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  created_by: string;
  created_at: string;
  downloads: number;
  author?: { full_name: string | null } | null;
};

/** Public URL for a file stored in the `notes` bucket. */
export function noteFileUrl(supabase: Awaited<ReturnType<typeof getSupabase>>, filePath: string): string | null {
  if (!supabase) return null;
  return supabase.storage.from(NOTE_BUCKET).getPublicUrl(filePath).data.publicUrl ?? null;
}

export async function listNotes(search?: string): Promise<Note[]> {
  const supabase = await getSupabase();
  const term = search?.trim().toLowerCase() ?? "";

  if (!supabase) {
    return [...demoDb.notes]
      .map((note) => ({ ...note, author_name: demoProfileName(note.created_by), file_url: null }))
      .filter((note) =>
        term
          ? [note.title, note.subject, note.course_code, note.description].some((field) =>
              (field ?? "").toLowerCase().includes(term),
            )
          : true,
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  let query = supabase
    .from("notes")
    .select("*, author:profiles!notes_created_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (term) {
    const pattern = `%${term}%`;
    query = query.or(`title.ilike.${pattern},subject.ilike.${pattern},course_code.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data as NoteRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    course_code: row.course_code,
    semester: row.semester,
    file_name: row.file_name,
    file_size: row.file_size,
    file_url: noteFileUrl(supabase, row.file_path),
    created_by: row.created_by,
    created_at: row.created_at,
    author_name: row.author?.full_name ?? null,
    downloads: row.downloads,
  }));
}

export async function listSubjects(): Promise<string[]> {
  const notes = await listNotes();
  return Array.from(new Set(notes.map((note) => note.subject).filter(Boolean))).sort();
}

/**
 * Uploads a note file to Supabase Storage and inserts the metadata row.
 * In demo mode the file is not stored (Supabase Storage is required), but the
 * metadata row is still created so the flow is fully explorable.
 */
export async function createNote(input: NoteInput, file: File, userId: string): Promise<{ storedInSupabase: boolean }> {
  const supabase = await getSupabase();

  if (!supabase) {
    demoDb.notes.unshift({
      id: nextId("note"),
      title: input.title,
      description: input.description,
      subject: input.subject,
      course_code: input.courseCode,
      semester: input.semester,
      file_name: file.name,
      file_size: file.size,
      file_url: null,
      created_by: userId,
      created_at: new Date().toISOString(),
      author_name: demoProfileName(userId),
      downloads: 0,
    });
    return { storedInSupabase: false };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(NOTE_BUCKET)
    .upload(filePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { error } = await supabase.from("notes").insert({
    title: input.title,
    description: input.description,
    subject: input.subject,
    course_code: input.courseCode,
    semester: input.semester,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    created_by: userId,
  });
  if (error) {
    await supabase.storage.from(NOTE_BUCKET).remove([filePath]);
    throw new Error(error.message);
  }

  return { storedInSupabase: true };
}

/** Increments the download counter (allowed via a SECURITY DEFINER RPC). */
export async function recordNoteDownload(noteId: string): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    const note = demoDb.notes.find((row) => row.id === noteId);
    if (note) note.downloads += 1;
    return;
  }

  const { error } = await supabase.rpc("increment_note_download", { note_id: noteId });
  if (error) throw new Error(error.message);
}

export async function deleteNote(noteId: string, userId: string): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    demoDb.notes = demoDb.notes.filter((note) => !(note.id === noteId && note.created_by === userId));
    return;
  }

  const { data } = await supabase.from("notes").select("file_path").eq("id", noteId).eq("created_by", userId).maybeSingle();
  const filePath = (data as { file_path: string } | null)?.file_path;

  const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("created_by", userId);
  if (error) throw new Error(error.message);

  if (filePath) await supabase.storage.from(NOTE_BUCKET).remove([filePath]);
}