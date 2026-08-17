import { createClient } from "@/lib/supabase/server";
import type { TimelineItem } from "@/types/database";

export async function getTimelineItems(
  weddingId: string,
): Promise<TimelineItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTimelineItemById(
  weddingId: string,
  itemId: string,
): Promise<TimelineItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("id", itemId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
