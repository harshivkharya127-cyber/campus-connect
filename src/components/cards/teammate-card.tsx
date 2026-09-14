import { ActionForm } from "@/components/action-form";
import { AuthorLine, Badge, Card } from "@/components/ui";
import { deleteTeammatePostAction, expressInterestAction, setTeammatePostOpenAction } from "@/lib/actions/teammates";
import type { TeammatePost } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

export function TeammateCard({ post, isOwner }: { post: TeammatePost; isOwner: boolean }) {
  return (
    <Card className="card-hover flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{post.project_type}</Badge>
        <Badge tone={post.is_open ? "success" : "default"}>{post.is_open ? "Open" : "Closed"}</Badge>
        <span className="text-xs text-slate-400">{post.interest_count} interested</span>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-slate-400">{post.description}</p>
      </div>

      {post.skills.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {post.skills.map((skill) => (
            <li key={skill} className="chip">
              {skill}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto space-y-3">
        <p className="text-xs text-slate-400">
          {post.deadline ? `Apply by ${formatDate(post.deadline)}` : "No deadline — reach out anytime"}
        </p>
        <AuthorLine name={post.author_name} timestamp={timeAgo(post.created_at)} />
        <div className="flex flex-wrap items-center gap-2">
          {post.is_open ? (
            <ActionForm
              action={expressInterestAction}
              fields={{ postId: post.id }}
              label={post.interested ? "Interest sent" : "I'm interested"}
              pendingLabel="Sending…"
              className={post.interested ? "btn-ghost" : "btn-primary"}
            />
          ) : null}
          {post.contact_url ? (
            <a href={post.contact_url} target="_blank" rel="noreferrer" className="btn-ghost">
              Contact link
            </a>
          ) : null}
          {isOwner ? (
            <>
              <ActionForm
                action={setTeammatePostOpenAction}
                fields={{ postId: post.id, isOpen: post.is_open ? "false" : "true" }}
                label={post.is_open ? "Close post" : "Reopen"}
                pendingLabel="Saving…"
                className="btn-ghost"
              />
              <ActionForm
                action={deleteTeammatePostAction}
                fields={{ postId: post.id }}
                label="Delete"
                pendingLabel="Deleting…"
                className="btn-danger"
              />
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}