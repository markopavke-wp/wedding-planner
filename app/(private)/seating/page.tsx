import { SeatingPlanner } from "@/components/seating/seating-planner";
import { getGuests, getTables, getWedding } from "@/lib/queries";

export default async function SeatingPage() {
  const wedding = await getWedding();
  if (wedding === null) {
    return (
      <p className="text-muted">
        Nema podataka o svadbi. Pokrenite seed u Supabase.
      </p>
    );
  }

  const [tables, guests] = await Promise.all([
    getTables(wedding.id),
    getGuests(wedding.id),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <SeatingPlanner
        wedding={wedding}
        initialTables={tables}
        initialGuests={guests}
      />
    </div>
  );
}
