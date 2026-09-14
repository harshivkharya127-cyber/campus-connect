import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader, PageShell } from "@/components/page-header";

export default function EventsLoading() {
  return (
    <PageShell>
      <PageHeader eyebrow="Campus" title="Events" description="Fests, workshops, club mixers and placement talks." />
      <ListSkeleton />
    </PageShell>
  );
}