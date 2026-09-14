"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage, SelectField, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { createEventAction } from "@/lib/actions/events";
import { EVENT_CATEGORIES, initialActionState } from "@/lib/types";

export function EventForm() {
  const [state, formAction] = useActionState(createEventAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <TextField
        label="Event title"
        name="title"
        placeholder="HackSprint 2026 — 36 hour hackathon"
        required
        maxLength={140}
      />
      <TextAreaField
        label="Description"
        name="description"
        placeholder="What happens, who should come, what should they bring?"
        maxLength={1500}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Category" name="category" options={EVENT_CATEGORIES} defaultValue="Tech" />
        <TextField label="Location" name="location" placeholder="Innovation Lab, Block C" maxLength={140} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Starts" name="startsAt" type="datetime-local" required />
        <TextField label="Ends" name="endsAt" type="datetime-local" />
        <TextField
          label="Capacity"
          name="capacity"
          type="number"
          min={1}
          max={100000}
          placeholder="120"
          hint="Optional — leave empty if there's no fixed limit."
        />
      </div>
      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton className="btn-primary w-full" pendingText="Publishing…">
        Publish event
      </SubmitButton>
    </form>
  );
}