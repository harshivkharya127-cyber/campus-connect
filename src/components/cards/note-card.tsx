import { ActionForm } from "@/components/action-form";
import { AuthorLine, Badge, Card } from "@/components/ui";
import { deleteNoteAction, downloadNoteAction } from "@/lib/actions/notes";
import type { Note } from "@/lib/types";
import { formatFileSize, timeAgo } from "@/lib/utils";

export function NoteCard({ note, isOwner }: { note: Note; isOwner: boolean }) {
  return (
    <Card className="card-hover flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{note.subject}</Badge>
        {note.course_code ? <Badge>{note.course_code}</Badge> : null}
        {note.semester ? <span className="text-xs text-slate-400">{note.semester}</span> : null}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{note.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">{note.description}</p>
      </div>

      <p className="font-mono text-xs text-slate-400">
        {note.file_name} · {formatFileSize(note.file_size)} · {note.downloads} downloads
      </p>

      <div className="mt-auto space-y-3">
        <AuthorLine name={note.author_name} timestamp={timeAgo(note.created_at)} />
        <div className="flex flex-wrap items-center gap-2">
          <ActionForm
            action={downloadNoteAction}
            fields={{ noteId: note.id }}
            label={note.file_url ? "Download" : "Preview only"}
            pendingLabel="Preparing…"
            className={note.file_url ? "btn-primary" : "btn-ghost"}
          />
          {isOwner ? (
            <ActionForm
              action={deleteNoteAction}
              fields={{ noteId: note.id }}
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