"use server";

import { revalidatePath } from "next/cache";

import {
  bulkAssignTableSchema,
  guestCreateSchema,
  guestUpdateSchema,
} from "@/lib/validation/guest";
import { revalidateAppPaths } from "@/lib/utils";
import type { Guest } from "@/types/database";

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

export async function createGuest(
  input: unknown,
): Promise<ActionResult<Guest>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(guestCreateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("guests")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje gosta nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateGuest(
  input: unknown,
): Promise<ActionResult<Guest>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(guestUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { id, wedding_id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("guests")
    .update(updates)
    .eq("id", id)
    .eq("wedding_id", wedding_id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje gosta nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteGuest(
  weddingId: string,
  guestId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("guests")
    .delete()
    .eq("id", guestId)
    .eq("wedding_id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje gosta nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function bulkAssignGuestsToTable(
  input: unknown,
): Promise<ActionResult<{ updated: number }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(bulkAssignTableSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("guests")
    .update({ table_id: parsed.data.table_id, seat_number: null })
    .eq("wedding_id", parsed.data.wedding_id)
    .in("id", parsed.data.guest_ids)
    .select("id");

  if (error) {
    return failure(error.message);
  }

  revalidateApp();
  return success({ updated: data?.length ?? 0 });
}

export async function assignGuestToTable(
  weddingId: string,
  guestId: string,
  tableId: string | null,
): Promise<ActionResult<Guest>> {
  return updateGuest({
    id: guestId,
    wedding_id: weddingId,
    table_id: tableId,
    seat_number: null,
  });
}
