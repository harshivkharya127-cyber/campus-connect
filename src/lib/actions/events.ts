"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/data/auth";
import { createEvent, deleteOwnEvent, toggleEventRsvp } from "@/lib/data/events";
import type { ActionState } from "@/lib/types";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const title = str(formData.get("title"));
  if (title.length < 4) return { ok: false, message: "Give your event a title of at least 4 characters." };

  const startsAt = parseDate(str(formData.get("startsAt")));
  if (!startsAt) return { ok: false, message: "Pick a date and time for the event." };

  const endsAtRaw = str(formData.get("endsAt"));
  const endsAt = endsAtRaw ? parseDate(endsAtRaw) : null;
  if (endsAtRaw && !endsAt) return { ok: false, message: "The end time could not be parsed." };
  if (endsAt && endsAt <= startsAt) return { ok: false, message: "The end time must be after the start time." };

  const capacityRaw = str(formData.get("capacity"));
  const capacity = capacityRaw ? Number.parseInt(capacityRaw, 10) : null;
  if (capacityRaw && (capacity === null || Number.isNaN(capacity) || capacity < 1)) {
    return { ok: false, message: "Capacity should be a positive number, or leave it empty." };
  }

  try {
    await createEvent(
      {
        title,
        description: str(formData.get("description")) || null,
        category: str(formData.get("category")) || "Other",
        location: str(formData.get("location")) || null,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt ? endsAt.toISOString() : null,
        capacity,
      },
      user.id,
    );
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not create the event." };
  }

  revalidatePath("/events");
  revalidatePath("/");
  return { ok: true, message: "Event published." };
}

export async function toggleRsvpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const eventId = str(formData.get("eventId"));
  if (!eventId) return { ok: false, message: "Missing event." };

  try {
    const joined = await toggleEventRsvp(eventId, user.id);
    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/profile");
    return { ok: true, message: joined ? "You're going." : "RSVP removed." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not update your RSVP." };
  }
}

export async function deleteEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const eventId = str(formData.get("eventId"));
  if (!eventId) return { ok: false, message: "Missing event." };

  try {
    await deleteOwnEvent(eventId, user.id);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not delete the event." };
  }

  revalidatePath("/events");
  revalidatePath("/");
  return { ok: true, message: "Event deleted." };
}