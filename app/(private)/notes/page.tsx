import { getNotes, getWedding } from "@/lib/queries";
import { NotesUI } from "@/components/notes/notes-ui";

export default async function NotesPage() {
  const wedding = await getWedding();
  if (!wedding) return <p className="p-8 text-muted">Nema podataka o svadbi.</p>;

  const notes = await getNotes(wedding.id);

  return (
    <div className="p-6 sm:p-8">
      <NotesUI weddingId={wedding.id} initialNotes={notes} />
    </div>
  );
}
