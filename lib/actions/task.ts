"use server";

import { revalidatePath } from "next/cache";

import { taskCreateSchema, taskUpdateSchema } from "@/lib/validation/task";
import { revalidateAppPaths } from "@/lib/utils";
import type { Task } from "@/types/database";

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

export async function createTask(input: unknown): Promise<ActionResult<Task>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(taskCreateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("tasks")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje taska nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateTask(input: unknown): Promise<ActionResult<Task>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(taskUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { id, wedding_id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .eq("wedding_id", wedding_id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje taska nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteTask(
  weddingId: string,
  taskId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("wedding_id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje taska nije uspelo");
  }

  revalidateApp();
  return success(data);
}
