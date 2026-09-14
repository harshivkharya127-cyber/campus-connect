/** Small helpers shared across the app. */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Deterministic date formatting (server-rendered, so no hydration mismatch). */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function timeAgo(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);

  // Words instead of "2h ago" — reads like a person wrote it, and the
  // singular/plural split keeps "1 hour ago" grammatical.
  const span = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"} ago`;

  if (minutes < 1) return "just now";
  if (minutes < 60) return span(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return span(hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return span(days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return span(months, "month");
  return span(Math.round(months / 12), "year");
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, exponent);
  return `${size >= 10 || exponent === 0 ? Math.round(size) : size.toFixed(1)} ${units[exponent]}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "club";
}

export function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 6),
    ),
  );
}

export function firstError(messages: Array<string | null | undefined>): string | undefined {
  return messages.find((message): message is string => Boolean(message));
}