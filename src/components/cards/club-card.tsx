import { ActionForm } from "@/components/action-form";
import { Badge, Card } from "@/components/ui";
import { toggleClubMembershipAction } from "@/lib/actions/clubs";
import type { Club } from "@/lib/types";

export function ClubCard({ club }: { club: Club }) {
  return (
    <Card className="card-hover flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Badge tone="accent">{club.category}</Badge>
        <span className="text-xs text-ink-muted">{club.member_count} members</span>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-navy-900">{club.name}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-ink-muted">{club.description}</p>
      </div>

      <div className="mt-auto space-y-3">
        {club.contact_email ? (
          <p className="text-xs text-ink-muted">
            Contact: <a href={`mailto:${club.contact_email}`} className="link">{club.contact_email}</a>
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <ActionForm
            action={toggleClubMembershipAction}
            fields={{ clubId: club.id }}
            label={club.joined ? "Leave club" : "Join club"}
            pendingLabel="Saving…"
            className={club.joined ? "btn-quiet" : "btn-primary"}
          />
          <span className="chip font-mono text-[11px] text-ink-muted">/{club.slug}</span>
        </div>
      </div>
    </Card>
  );
}