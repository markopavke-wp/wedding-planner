"use server";

import { revalidatePath } from "next/cache";

import {
  tableCreateSchema,
  tablePositionSchema,
  tableSideBatchSchema,
  tableUpdateSchema,
} from "@/lib/validation/table";
import { revalidateAppPaths } from "@/lib/utils";
import type { SeatingTable } from "@/types/database";

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

export async function createTable(
  input: unknown,
): Promise<ActionResult<SeatingTable>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(tableCreateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("tables")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje stola nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateTable(
  input: unknown,
): Promise<ActionResult<SeatingTable>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(tableUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { id, wedding_id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("tables")
    .update(updates)
    .eq("id", id)
    .eq("wedding_id", wedding_id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje stola nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteTable(
  weddingId: string,
  tableId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("tables")
    .delete()
    .eq("id", tableId)
    .eq("wedding_id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje stola nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateTablePosition(
  input: unknown,
): Promise<ActionResult<SeatingTable>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(tablePositionSchema, input);
  if (!parsed.success) return parsed;

  return updateTable(parsed.data);
}

export async function applyTableSideAssignments(
  input: unknown,
): Promise<ActionResult<{ updated: number }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(tableSideBatchSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  let updated = 0;
  for (const assignment of parsed.data.assignments) {
    const { error } = await auth.data.supabase
      .from("tables")
      .update({ side: assignment.side })
      .eq("id", assignment.id)
      .eq("wedding_id", parsed.data.wedding_id);

    if (!error) updated += 1;
  }

  revalidateApp();
  return success({ updated });
}
