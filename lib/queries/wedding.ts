import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/types/database";

export async function getWedding(): Promise<Wedding | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wedding")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getWeddingById(
  weddingId: string,
): Promise<Wedding | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wedding")
    .select("*")
    .eq("id", weddingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
