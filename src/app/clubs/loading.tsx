import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader, PageShell } from "@/components/page-header";

export default function ClubsLoading() {
  return (
    <PageShell>
      <PageHeader eyebrow="Campus" title="Clubs & societies" description="Every society on campus, from robotics to film." />
      <ListSkeleton />
    </PageShell>
  );
}