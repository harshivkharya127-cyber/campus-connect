"use client";

import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";
import { initialActionState, type ActionState } from "@/lib/types";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Button-only form used for one-click mutations (RSVP, join club, accept answer…).
 * Hidden inputs carry the ids the server action needs.
 *
 * Pass `confirm` for destructive actions: the first click only arms a short
 * confirmation ("Delete this event? This can't be undone."), and the request
 * fires only after the user picks "Yes, delete" — with a visible way out.
 */
export function ActionForm({
  action,
  fields = {},
  label,
  pendingLabel,
  className = "btn-quiet",
  confirm,
}: {
  action: Action;
  fields?: Record<string, string | number | boolean>;
  label: string;
  pendingLabel?: string;
  className?: string;
  /** The noun being deleted, e.g. confirm="event". Omit for non-destructive actions. */
  confirm?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1.5">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}

      {confirm && !confirming ? (
        <button type="button" onClick={() => setConfirming(true)} className={className}>
          {label}
        </button>
      ) : confirm ? (
        <>
          <p className="text-meta font-medium text-ink">Delete this {confirm}? This can&apos;t be undone.</p>
          <div className="flex items-center gap-2">
            <SubmitButton className="btn-danger" pendingText={pendingLabel ?? "Deleting…"}>
              Yes, delete
            </SubmitButton>
            <button type="button" onClick={() => setConfirming(false)} className="btn-quiet">
              Keep it
            </button>
          </div>
        </>
      ) : (
        <SubmitButton className={className} pendingText={pendingLabel ?? "Working…"}>
          {label}
        </SubmitButton>
      )}

      {state.message ? (
        <p className={cn("text-meta", state.ok ? "text-positive" : "text-danger")} role={state.ok ? "status" : "alert"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}