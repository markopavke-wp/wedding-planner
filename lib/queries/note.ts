import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/types/database";

export async function getNotes(weddingId: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getNoteById(
  weddingId: string,
  noteId: string,
): Promise<Note | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("id", noteId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
