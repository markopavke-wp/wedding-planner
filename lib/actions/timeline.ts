"use server";

import { revalidatePath } from "next/cache";

import {
  timelineCreateSchema,
  timelineUpdateSchema,
} from "@/lib/validation/timeline";
import { revalidateAppPaths } from "@/lib/utils";
import type { TimelineItem } from "@/types/database";

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

export async function createTimelineItem(
  input: unknown,
): Promise<ActionResult<TimelineItem>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(timelineCreateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("timeline_items")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje stavke nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateTimelineItem(
  input: unknown,
): Promise<ActionResult<TimelineItem>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(timelineUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { id, wedding_id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("timeline_items")
    .update(updates)
    .eq("id", id)
    .eq("wedding_id", wedding_id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje stavke nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteTimelineItem(
  weddingId: string,
  itemId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("timeline_items")
    .delete()
    .eq("id", itemId)
    .eq("wedding_id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje stavke nije uspelo");
  }

  revalidateApp();
  return success(data);
}
