import { ActionForm } from "@/components/action-form";
import { AuthorLine, Badge, Card } from "@/components/ui";
import { deleteEventAction, toggleRsvpAction } from "@/lib/actions/events";
import type { CampusEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const CATEGORY_TONES: Record<string, "brand" | "success" | "warning" | "danger" | "default"> = {
  Tech: "brand",
  Academic: "success",
  Career: "warning",
  Cultural: "danger",
  Sports: "default",
  Social: "success",
  Other: "default",
};

export function EventCard({ event, isOwner }: { event: CampusEvent; isOwner: boolean }) {
  const spotsLeft = event.capacity ? Math.max(event.capacity - event.rsvp_count, 0) : null;
  const fillPercent = event.capacity ? Math.min(Math.round((event.rsvp_count / event.capacity) * 100), 100) : null;

  return (
    <Card className="card-hover flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={CATEGORY_TONES[event.category] ?? "default"}>{event.category}</Badge>
        <Badge tone={event.joined ? "success" : "default"}>
          {event.joined ? "You're going" : `${event.rsvp_count} going`}
        </Badge>
        {spotsLeft !== null ? (
          <span className="text-xs text-slate-400">
            {spotsLeft === 0 ? "Waitlist only" : `${spotsLeft} spots left`}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Open entry</span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-slate-400">{event.description}</p>
      </div>

      <dl className="grid gap-1 text-sm text-slate-300">
        <div className="flex items-start gap-2">
          <dt className="text-slate-500">When</dt>
          <dd className="font-medium">{formatDateTime(event.starts_at)}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="text-slate-500">Where</dt>
          <dd className="font-medium">{event.location ?? "To be announced"}</dd>
        </div>
      </dl>

      {fillPercent !== null ? (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400" style={{ width: `${fillPercent}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {event.rsvp_count}/{event.capacity} seats filled
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-3">
        <AuthorLine name={event.author_name} timestamp={formatDateTime(event.created_at)} />
        <div className="flex flex-wrap items-center gap-2">
          <ActionForm
            action={toggleRsvpAction}
            fields={{ eventId: event.id }}
            label={event.joined ? "Cancel RSVP" : "RSVP"}
            pendingLabel="Saving…"
            className={event.joined ? "btn-ghost" : "btn-primary"}
          />
          {isOwner ? (
            <ActionForm
              action={deleteEventAction}
              fields={{ eventId: event.id }}
              label="Delete"
              pendingLabel="Deleting…"
              className="btn-danger"
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}