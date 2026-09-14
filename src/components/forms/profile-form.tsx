"use client";

import { useActionState } from "react";

import { FormMessage, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { updateProfileAction } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/types";

export function ProfileForm({
  fullName,
  username,
  college,
  major,
  gradYear,
  bio,
}: {
  fullName: string;
  username: string;
  college: string | null;
  major: string | null;
  gradYear: number | null;
  bio: string | null;
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" name="fullName" defaultValue={fullName} required maxLength={80} />
        <TextField
          label="Username"
          name="username"
          defaultValue={username}
          required
          maxLength={30}
          hint="Letters, numbers and underscores."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="College" name="college" defaultValue={college ?? ""} maxLength={100} />
        <TextField label="Major" name="major" defaultValue={major ?? ""} maxLength={80} />
        <TextField
          label="Graduation year"
          name="gradYear"
          type="number"
          min={2000}
          max={2040}
          defaultValue={gradYear ?? ""}
        />
      </div>
      <TextAreaField label="Bio" name="bio" defaultValue={bio ?? ""} maxLength={400} rows={3} />
      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton className="btn-primary" pendingText="Saving…">
        Save profile
      </SubmitButton>
    </form>
  );
}