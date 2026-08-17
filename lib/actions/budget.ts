"use server";

import { revalidatePath } from "next/cache";

import { budgetCreateSchema, budgetUpdateSchema } from "@/lib/validation/budget";
import { revalidateAppPaths } from "@/lib/utils";
import type { BudgetItem } from "@/types/database";

import {
  failure,
  parseInput,
  requireUser,
  requireWeddingAccess,
  success,
  type ActionResult,
} from "./helpers";

function revalidateApp() {
  for (const path of revalidateAppPaths()) {
    revalidatePath(path);
  }
}

export async function createBudgetItem(
  input: unknown,
): Promise<ActionResult<BudgetItem>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(budgetCreateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("budget_items")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje stavke budžeta nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateBudgetItem(
  input: unknown,
): Promise<ActionResult<BudgetItem>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(budgetUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { id, wedding_id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("budget_items")
    .update(updates)
    .eq("id", id)
    .eq("wedding_id", wedding_id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje stavke budžeta nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteBudgetItem(
  weddingId: string,
  itemId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("budget_items")
    .delete()
    .eq("id", itemId)
    .eq("wedding_id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje stavke budžeta nije uspelo");
  }

  revalidateApp();
  return success(data);
}
