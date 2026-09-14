"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage, SelectField, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { createClubAction } from "@/lib/actions/clubs";
import { CLUB_CATEGORIES, initialActionState } from "@/lib/types";

export function ClubForm() {
  const [state, formAction] = useActionState(createClubAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <TextField label="Club name" name="name" placeholder="Competitive Programming Society" required maxLength={120} />
      <TextAreaField
        label="What does the club do?"
        name="description"
        placeholder="Meetings, projects, who can join…"
        maxLength={1200}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Category" name="category" options={CLUB_CATEGORIES} defaultValue="Technology" />
        <TextField label="Contact email" name="contactEmail" type="email" placeholder="club@campus.edu" maxLength={140} />
      </div>
      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton className="btn-primary w-full" pendingText="Creating…">
        Create club
      </SubmitButton>
    </form>
  );
}