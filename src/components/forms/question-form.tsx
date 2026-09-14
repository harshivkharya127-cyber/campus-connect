"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { createQuestionAction } from "@/lib/actions/qa";
import { initialActionState } from "@/lib/types";

export function QuestionForm() {
  const [state, formAction] = useActionState(createQuestionAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <TextField
        label="Your question"
        name="title"
        placeholder="How do I start preparing for summer internships?"
        required
        maxLength={160}
      />
      <TextAreaField
        label="Context"
        name="body"
        placeholder="What have you tried, what exactly are you stuck on?"
        required
        maxLength={2000}
      />
      <TextField label="Tags" name="tags" placeholder="internships, career, dsa" hint="Comma separated — up to 6." maxLength={120} />
      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton className="btn-primary w-full" pendingText="Posting…">
        Post question
      </SubmitButton>
    </form>
  );
}