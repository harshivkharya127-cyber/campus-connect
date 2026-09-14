"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/data/auth";
import { acceptAnswer, createAnswer, createQuestion, getQuestionThread } from "@/lib/data/qa";
import type { ActionState } from "@/lib/types";
import { parseTags } from "@/lib/utils";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function createQuestionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const title = str(formData.get("title"));
  if (title.length < 10) return { ok: false, message: "Write a clear question title of at least 10 characters." };

  const body = str(formData.get("body"));
  if (body.length < 20) return { ok: false, message: "Add a bit more context (20+ characters) so people can help." };

  try {
    await createQuestion({ title, body, tags: parseTags(str(formData.get("tags"))) }, user.id);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not post your question." };
  }

  revalidatePath("/qa");
  revalidatePath("/");
  return { ok: true, message: "Question posted." };
}

export async function createAnswerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const questionId = str(formData.get("questionId"));
  if (!questionId) return { ok: false, message: "Missing question." };

  const body = str(formData.get("body"));
  if (body.length < 10) return { ok: false, message: "Answers need at least 10 characters." };

  try {
    await createAnswer(questionId, body, user.id);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not post your answer." };
  }

  revalidatePath(`/qa/${questionId}`);
  revalidatePath("/qa");
  return { ok: true, message: "Answer posted." };
}

export async function acceptAnswerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const answerId = str(formData.get("answerId"));
  if (!answerId) return { ok: false, message: "Missing answer." };

  try {
    await acceptAnswer(answerId, user.id);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not accept the answer." };
  }

  const questionId = str(formData.get("questionId"));
  if (questionId) {
    const thread = await getQuestionThread(questionId);
    revalidatePath(`/qa/${questionId}`);
    if (thread) revalidatePath("/qa");
  }

  return { ok: true, message: "Marked as accepted answer." };
}