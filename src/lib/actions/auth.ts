"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser, updateProfile } from "@/lib/data/auth";
import { isSupabaseConfigured } from "@/lib/data/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { slugify } from "@/lib/utils";

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const fullName = str(formData.get("fullName"));
  if (fullName.length < 2) return { ok: false, message: "Please enter your full name." };

  const username = slugify(str(formData.get("username")) || user.username).replace(/-/g, "_").slice(0, 30);
  if (username.length < 3) return { ok: false, message: "Username should be at least 3 characters." };

  const gradYearRaw = str(formData.get("gradYear"));
  const gradYear = gradYearRaw ? Number.parseInt(gradYearRaw, 10) : null;
  if (gradYear !== null && (Number.isNaN(gradYear) || gradYear < 2000 || gradYear > 2040)) {
    return { ok: false, message: "Graduation year should be between 2000 and 2040." };
  }

  try {
    await updateProfile(user.id, {
      fullName,
      username,
      college: str(formData.get("college")) || null,
      major: str(formData.get("major")) || null,
      gradYear,
      bio: str(formData.get("bio")) || null,
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save your profile." };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}