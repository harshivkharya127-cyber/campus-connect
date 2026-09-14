import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader, PageShell } from "@/components/page-header";

export default function NotesLoading() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Campus"
        title="Notes"
        description="Notes, lab records and past papers — uploaded by students, free to download."
      />
      <ListSkeleton count={4} />
    </PageShell>
  );
}