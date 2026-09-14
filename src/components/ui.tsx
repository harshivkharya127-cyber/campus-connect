import type { ReactNode } from "react";

import { cn, initials } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card", className)}>{children}</div>;
}

type Tone = "default" | "brand" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  default: "border-white/10 bg-white/5 text-slate-300",
  brand: "border-brand-400/30 bg-brand-500/15 text-brand-200",
  success: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  danger: "border-rose-400/30 bg-rose-500/15 text-rose-200",
};

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        TONES[tone],
      )}
    >
      {children}
    </span>
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
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

export function Avatar({ name, className }: { name: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-brand-500/40 to-sky-500/30 text-xs font-semibold text-white",
        className,
      )}
      title={name ?? "Student"}
    >
      {initials(name ?? "Student") || "?"}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function AuthorLine({ name, timestamp }: { name: string | null; timestamp: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <Avatar name={name} className="size-6 text-[10px]" />
      <span className="font-medium text-slate-300">{name ?? "Student"}</span>
      <span aria-hidden>·</span>
      <span>{timestamp}</span>
    </div>
  );
}