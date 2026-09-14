"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage, TextAreaField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { createAnswerAction } from "@/lib/actions/qa";
import { initialActionState } from "@/lib/types";

export function AnswerForm({ questionId }: { questionId: string }) {
  const [state, formAction] = useActionState(createAnswerAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="questionId" value={questionId} />
      <TextAreaField
        label="Your answer"
        name="body"
        placeholder="Share what worked for you, with specifics."
        required
        rows={4}
        maxLength={3000}
      />
      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton className="btn-primary" pendingText="Posting…">
        Post answer
      </SubmitButton>
    </form>
  );
}