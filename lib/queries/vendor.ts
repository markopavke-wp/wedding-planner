import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/types/database";

export async function getVendors(weddingId: string): Promise<Vendor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("category", { ascending: true })
    .order("company_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVendorById(
  weddingId: string,
  vendorId: string,
): Promise<Vendor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("id", vendorId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
