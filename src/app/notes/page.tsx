import { NoteCard } from "@/components/cards/note-card";
import { Panel } from "@/components/fields";
import { NoteUploadForm } from "@/components/forms/note-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { EmptyState, SectionHeading, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/auth";
import { listNotes } from "@/lib/data/notes";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Shared notes",
};

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUser();
  const notes = await listNotes(q);

  const uploaders = new Set(notes.map((note) => note.created_by)).size;
  const totalDownloads = notes.reduce((sum, note) => sum + note.downloads, 0);
  const subjects = Array.from(new Set(notes.map((note) => note.subject)));

  return (
    <PageShell>
      <PageHeader
        eyebrow="Notes"
        title="Notes that actually help"
        description="Last semester's toppers' notes, lab records and past papers — uploaded by students, free to download."
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Notes" value={notes.length} hint={subjects.length ? `${subjects.length} subjects` : "resources"} />
        <Stat label="Downloads" value={totalDownloads} hint="served to students" />
        <Stat label="Contributors" value={uploaders} hint="students sharing" />
        <Stat label="Subjects" value={subjects.length} hint="covered" />
      </section>

      <form action="/notes" method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label className="label" htmlFor="q">
            Search notes
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Try “DBMS”, “CS201” or “scheduling”"
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
        {q ? (
          <a href="/notes" className="btn-quiet">
            Clear
          </a>
        ) : null}
      </form>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section>
          <SectionHeading
            title={q ? `Results for “${q}”` : "Latest uploads"}
            description="Downloads are counted server-side before the file is handed over."
          />
          {notes.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} isOwner={note.created_by === user?.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={q ? `No notes match “${q}”` : "No notes shared yet"}
              description={
                q
                  ? "Try a subject name, a course code, or a broader keyword."
                  : "Upload the first set of notes — your juniors will thank you."
              }
              action={
                q ? (
                  <a href="/notes" className="btn-outline btn-sm">
                    Clear search
                  </a>
                ) : (
                  <a href="#share" className="btn-primary btn-sm">
                    Upload notes
                  </a>
                )
              }
            />
          )}
        </section>

        <aside id="share" className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Panel title="Share your notes" description="PDF, Office or image files up to 10 MB.">
            {user ? (
              <NoteUploadForm demoMode={!isSupabaseConfigured} />
            ) : (
              <SignInPrompt message="Log in to upload notes for your juniors." />
            )}
          </Panel>

          <div className="card">
            <h3 className="text-sm font-semibold text-navy-900">Where the files go</h3>
            <p className="mt-2 text-sm text-ink-muted">
              The file is uploaded to the <code className="rounded bg-cream-200 px-1 font-mono text-xs">notes</code> bucket
              under a folder named after the uploader&apos;s user id, and the row keeps the storage path, size and MIME type.
              Storage policies are scoped the same way as the tables.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}