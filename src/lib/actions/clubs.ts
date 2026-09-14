"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/data/auth";
import { createClub, toggleClubMembership } from "@/lib/data/clubs";
import type { ActionState } from "@/lib/types";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function createClubAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const name = str(formData.get("name"));
  if (name.length < 3) return { ok: false, message: "Club name should be at least 3 characters." };

  const contactEmail = str(formData.get("contactEmail"));
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { ok: false, message: "That contact email doesn't look right." };
  }

  try {
    await createClub(
      {
        name,
        description: str(formData.get("description")) || null,
        category: str(formData.get("category")) || "Other",
        contactEmail: contactEmail || null,
      },
      user.id,
    );
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not create the club." };
  }

  revalidatePath("/clubs");
  revalidatePath("/");
  return { ok: true, message: "Club created — you're the admin." };
}

export async function toggleClubMembershipAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const clubId = str(formData.get("clubId"));
  if (!clubId) return { ok: false, message: "Missing club." };

  try {
    const joined = await toggleClubMembership(clubId, user.id);
    revalidatePath("/clubs");
    revalidatePath("/profile");
    return { ok: true, message: joined ? "Welcome to the club." : "You left the club." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not update your membership." };
  }
}