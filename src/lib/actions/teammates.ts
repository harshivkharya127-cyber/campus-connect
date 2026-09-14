"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/data/auth";
import { createTeammatePost, deleteTeammatePost, expressInterest, setTeammatePostOpen } from "@/lib/data/teammates";
import type { ActionState } from "@/lib/types";
import { parseTags } from "@/lib/utils";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function createTeammatePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const title = str(formData.get("title"));
  if (title.length < 5) return { ok: false, message: "Describe what you're looking for in at least 5 characters." };

  const deadlineRaw = str(formData.get("deadline"));
  let deadline: string | null = null;
  if (deadlineRaw) {
    const parsed = new Date(deadlineRaw);
    if (Number.isNaN(parsed.getTime())) return { ok: false, message: "That deadline looks invalid." };
    deadline = parsed.toISOString();
  }

  const contactUrl = str(formData.get("contactUrl"));
  if (contactUrl && !/^https?:\/\//i.test(contactUrl)) {
    return { ok: false, message: "Contact link should start with http:// or https://" };
  }

  try {
    await createTeammatePost(
      {
        title,
        description: str(formData.get("description")) || null,
        projectType: str(formData.get("projectType")) || "Hackathon",
        skills: parseTags(str(formData.get("skills"))),
        deadline,
        contactUrl: contactUrl || null,
      },
      user.id,
    );
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not publish your post." };
  }

  revalidatePath("/teammates");
  revalidatePath("/");
  return { ok: true, message: "Post published — teammates can now reach you." };
}

export async function expressInterestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const postId = str(formData.get("postId"));
  if (!postId) return { ok: false, message: "Missing post." };

  try {
    await expressInterest(postId, user.id, str(formData.get("message")) || null);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not send your interest." };
  }

  revalidatePath("/teammates");
  return { ok: true, message: "Interest sent." };
}

export async function setTeammatePostOpenAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const postId = str(formData.get("postId"));
  const isOpen = str(formData.get("isOpen")) === "true";
  if (!postId) return { ok: false, message: "Missing post." };

  try {
    await setTeammatePostOpen(postId, user.id, isOpen);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not update the post." };
  }

  revalidatePath("/teammates");
  return { ok: true, message: isOpen ? "Post reopened." : "Post closed." };
}

export async function deleteTeammatePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const postId = str(formData.get("postId"));
  if (!postId) return { ok: false, message: "Missing post." };

  try {
    await deleteTeammatePost(postId, user.id);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not delete the post." };
  }

  revalidatePath("/teammates");
  revalidatePath("/");
  return { ok: true, message: "Post deleted." };
}