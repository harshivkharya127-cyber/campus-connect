"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";
import { initialActionState, type ActionState } from "@/lib/types";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Button-only form used for one-click mutations (RSVP, join club, accept answer…).
 * Hidden inputs carry the ids the server action needs.
 */
export function ActionForm({
  action,
  fields = {},
  label,
  pendingLabel,
  className = "btn-ghost",
}: {
  action: Action;
  fields?: Record<string, string | number | boolean>;
  label: string;
  pendingLabel?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1.5">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}
      <SubmitButton className={className} pendingText={pendingLabel ?? "…"}>
        {label}
      </SubmitButton>
      {state.message ? (
        <p className={cn("text-xs", state.ok ? "text-emerald-300" : "text-amber-300")}>{state.message}</p>
      ) : null}
    </form>
  );
}