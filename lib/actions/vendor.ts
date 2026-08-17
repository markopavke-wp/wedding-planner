"use server";

import { revalidatePath } from "next/cache";

import { vendorCreateSchema, vendorUpdateSchema } from "@/lib/validation/vendor";
import { revalidateAppPaths } from "@/lib/utils";
import type { Vendor } from "@/types/database";

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

export async function createVendor(
  input: unknown,
): Promise<ActionResult<Vendor>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(vendorCreateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("vendors")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje dobavljača nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateVendor(
  input: unknown,
): Promise<ActionResult<Vendor>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(vendorUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { id, wedding_id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("vendors")
    .update(updates)
    .eq("id", id)
    .eq("wedding_id", wedding_id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje dobavljača nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteVendor(
  weddingId: string,
  vendorId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("vendors")
    .delete()
    .eq("id", vendorId)
    .eq("wedding_id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje dobavljača nije uspelo");
  }

  revalidateApp();
  return success(data);
}
