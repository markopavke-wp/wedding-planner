import { createClient } from "@/lib/supabase/server";
import type { Guest, SeatingTable } from "@/types/database";

export type TableWithGuests = SeatingTable & {
  guests: Guest[];
};

export async function getTables(weddingId: string): Promise<SeatingTable[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTableById(
  weddingId: string,
  tableId: string,
): Promise<SeatingTable | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("id", tableId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTablesWithGuests(
  weddingId: string,
): Promise<TableWithGuests[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tables")
    .select("*, guests(*)")
    .eq("wedding_id", weddingId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    wedding_id: row.wedding_id,
    name: row.name,
    capacity: row.capacity,
    shape: row.shape,
    position_x: row.position_x,
    position_y: row.position_y,
    width: row.width,
    height: row.height,
    rotation: row.rotation,
    side: row.side,
    notes: row.notes,
    created_at: row.created_at,
    guests: row.guests ?? [],
  }));
}
