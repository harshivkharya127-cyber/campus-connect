"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage, SelectField, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { createTeammatePostAction } from "@/lib/actions/teammates";
import { PROJECT_TYPES, initialActionState } from "@/lib/types";

export function TeammateForm() {
  const [state, formAction] = useActionState(createTeammatePostAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <TextField
        label="What do you need?"
        name="title"
        placeholder="Need a frontend dev for Smart India Hackathon"
        required
        maxLength={140}
      />
      <TextAreaField
        label="Details"
        name="description"
        placeholder="Project idea, time commitment, how you work together…"
        maxLength={1500}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Project type" name="projectType" options={PROJECT_TYPES} defaultValue="Hackathon" />
        <TextField label="Deadline" name="deadline" type="date" />
      </div>
      <TextField
        label="Skills wanted"
        name="skills"
        placeholder="React, TypeScript, Tailwind CSS"
        hint="Comma separated — up to 6 skills."
        maxLength={160}
      />
      <TextField
        label="Contact link (optional)"
        name="contactUrl"
        type="url"
        placeholder="https://github.com/your-handle"
        maxLength={200}
      />
      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton className="btn-primary w-full" pendingText="Publishing…">
        Publish post
      </SubmitButton>
    </form>
  );
}