import type { ReactNode } from "react";

import { cn, initials } from "@/lib/utils";

/**
 * Shared UI primitives.
 * Every screen composes these, which is what keeps spacing, colour and states
 * consistent. They contain no data fetching and no business rules.
 */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardTitle({ children, as: Tag = "h3" }: { children: ReactNode; as?: "h2" | "h3" }) {
  return <Tag className="text-base font-semibold">{children}</Tag>;
}

type BadgeTone = "neutral" | "accent" | "positive" | "caution" | "danger";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "badge-neutral",
  accent: "badge-accent",
  positive: "badge-positive",
  caution: "badge-caution",
  danger: "badge-danger",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={BADGE_TONES[tone]}>{children}</span>;
}

/** Initials avatar — used until a student uploads a picture. */
export function Avatar({ name, className }: { name: string | null; className?: string }) {
  const label = name?.trim() || "A student";
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-meta font-semibold text-navy-800",
        className,
      )}
      title={label}
    >
      {initials(label) || "?"}
    </span>
  );
}

/** "Who posted this" line: initials avatar + name + relative time. */
export function AuthorLine({ name, timestamp }: { name: string | null; timestamp: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar name={name} className="size-7 text-[11px]" />
      <p className="text-meta text-ink-muted">
        <span className="font-medium text-ink">{name ?? "A student"}</span>
        <span aria-hidden="true"> · </span>
        <span>{timestamp}</span>
      </p>
    </div>
  );
}

/**
 * Placeholder block for route-level loading.tsx files. A soft pulse says
 * "content is coming" without committing to a layout that might not match.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-4 py-3">
      <p className="text-xl font-semibold text-navy-900 tabular-nums">{value}</p>
      <p className="mt-0.5 text-meta text-ink-muted">{label}</p>
      {hint ? <p className="text-meta text-ink-muted/80">{hint}</p> : null}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-0.5 max-w-2xl text-meta text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/**
 * Empty states always offer the next action, so a blank page is never a dead end.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <p className="font-medium text-navy-900">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-md text-meta text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}