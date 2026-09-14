import type { ReactNode } from "react";

/** Consistent page hero used by every top-level route. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-xs font-semibold tracking-widest text-accent-700 uppercase">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-ink-muted sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="space-y-8">{children}</div>;
}