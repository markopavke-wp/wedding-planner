"use server";

import { revalidatePath } from "next/cache";

import {
  weddingCreateSchema,
  weddingUpdateSchema,
} from "@/lib/validation/wedding";
import { revalidateAppPaths } from "@/lib/utils";
import type { Wedding } from "@/types/database";

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

export async function createWedding(
  input: unknown,
): Promise<ActionResult<Wedding>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(weddingCreateSchema, input);
  if (!parsed.success) return parsed;

  const { data, error } = await auth.data.supabase
    .from("wedding")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje svadbe nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateWedding(
  input: unknown,
): Promise<ActionResult<Wedding>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(weddingUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.id,
  );
  if (!access.success) return access;

  const { id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("wedding")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje svadbe nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteWedding(
  weddingId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("wedding")
    .delete()
    .eq("id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje svadbe nije uspelo");
  }

  revalidateApp();
  return success(data);
}
