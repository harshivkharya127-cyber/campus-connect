import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader, PageShell } from "@/components/page-header";

export default function QaLoading() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Campus"
        title="Questions & answers"
        description="Ask anything about campus life — electives, internships, exam prep."
      />
      <ListSkeleton count={4} />
    </PageShell>
  );
}