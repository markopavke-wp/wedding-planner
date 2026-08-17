import { getTimelineItems, getWedding } from "@/lib/queries";
import { TimelineUI } from "@/components/timeline/timeline-ui";

export default async function TimelinePage() {
  const wedding = await getWedding();
  if (!wedding) return <p className="p-8 text-muted">Nema podataka o svadbi.</p>;

  const items = await getTimelineItems(wedding.id);

  return (
    <div className="p-6 sm:p-8">
      <TimelineUI weddingId={wedding.id} initialItems={items} />
    </div>
  );
}
