import { createClient } from "@/lib/supabase/server";
import type { BudgetItem, BudgetStatus } from "@/types/database";

export async function getBudgetItems(
  weddingId: string,
): Promise<BudgetItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBudgetItemsByStatus(
  weddingId: string,
  status: BudgetStatus,
): Promise<BudgetItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("status", status)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBudgetItemsByCategory(
  weddingId: string,
  category: string,
): Promise<BudgetItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("category", category)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
