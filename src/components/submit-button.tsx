"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

/** Submit button that disables itself while the surrounding form is pending. */
export function SubmitButton({
  children,
  pendingText = "Working…",
  className = "btn-primary",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(className)}>
      {pending ? pendingText : children}
    </button>
  );
}