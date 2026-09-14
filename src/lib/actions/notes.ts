"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/data/auth";
import { createNote, deleteNote, listNotes, recordNoteDownload } from "@/lib/data/notes";
import { MAX_NOTE_FILE_BYTES } from "@/lib/env";
import type { ActionState } from "@/lib/types";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function uploadNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const title = str(formData.get("title"));
  if (title.length < 5) return { ok: false, message: "Give your notes a descriptive title (5+ characters)." };

  const subject = str(formData.get("subject"));
  if (!subject) return { ok: false, message: "Which subject are these notes for?" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Attach the file you want to share." };
  }
  if (file.size > MAX_NOTE_FILE_BYTES) {
    return { ok: false, message: "Files must be 10 MB or smaller. Compress your PDF and try again." };
  }

  let storedInSupabase = true;
  try {
    const result = await createNote(
      {
        title,
        description: str(formData.get("description")) || null,
        subject,
        courseCode: str(formData.get("courseCode")) || null,
        semester: str(formData.get("semester")) || null,
      },
      file,
      user.id,
    );
    storedInSupabase = result.storedInSupabase;
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Upload failed, please retry." };
  }

  revalidatePath("/notes");
  revalidatePath("/");
  return {
    ok: true,
    message: storedInSupabase
      ? "Notes uploaded and shared."
      : "Demo mode: metadata saved, but connect Supabase Storage to store the actual file.",
  };
}

/** Counts the download, then hands the visitor the file. */
export async function downloadNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const noteId = str(formData.get("noteId"));
  if (!noteId) return { ok: false, message: "Missing note." };

  const note = (await listNotes()).find((row) => row.id === noteId);
  if (!note?.file_url) {
    return { ok: false, message: "This sample note has no file attached — connect Supabase Storage to enable downloads." };
  }

  try {
    await recordNoteDownload(noteId);
  } catch {
    /* A failed counter should never block the download. */
  }

  revalidatePath("/notes");
  redirect(note.file_url);
}

export async function deleteNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const noteId = str(formData.get("noteId"));
  if (!noteId) return { ok: false, message: "Missing note." };

  try {
    await deleteNote(noteId, user.id);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not delete the note." };
  }

  revalidatePath("/notes");
  revalidatePath("/");
  return { ok: true, message: "Note deleted." };
}