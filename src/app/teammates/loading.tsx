import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader, PageShell } from "@/components/page-header";

export default function TeammatesLoading() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Campus"
        title="Find teammates"
        description="Hackathon squads, study groups, research partners and side projects."
      />
      <ListSkeleton count={4} />
    </PageShell>
  );
}