import { createClient } from "@/lib/supabase/server";
import type { Task, TaskStatus } from "@/types/database";

export async function getTasks(weddingId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Alias koji koriste app stranice. */
export const getTasksByWedding = getTasks;

export async function getTasksByStatus(
  weddingId: string,
  status: TaskStatus,
): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("status", status)
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUpcomingTasks(
  weddingId: string,
  limit = 8,
): Promise<Task[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("wedding_id", weddingId)
    .neq("status", "completed")
    .gte("deadline", today)
    .order("deadline", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
