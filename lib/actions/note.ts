"use server";

import { revalidatePath } from "next/cache";

import { noteCreateSchema, noteUpdateSchema } from "@/lib/validation/note";
import { revalidateAppPaths } from "@/lib/utils";
import type { Note } from "@/types/database";

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

export async function createNote(input: unknown): Promise<ActionResult<Note>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(noteCreateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("notes")
    .insert({
      ...parsed.data,
      created_by: auth.data.user.id,
    })
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Kreiranje beleške nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function updateNote(input: unknown): Promise<ActionResult<Note>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const parsed = parseInput(noteUpdateSchema, input);
  if (!parsed.success) return parsed;

  const access = await requireWeddingAccess(
    auth.data.supabase,
    parsed.data.wedding_id,
  );
  if (!access.success) return access;

  const { id, wedding_id, ...updates } = parsed.data;
  const { data, error } = await auth.data.supabase
    .from("notes")
    .update(updates)
    .eq("id", id)
    .eq("wedding_id", wedding_id)
    .select()
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Ažuriranje beleške nije uspelo");
  }

  revalidateApp();
  return success(data);
}

export async function deleteNote(
  weddingId: string,
  noteId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const access = await requireWeddingAccess(auth.data.supabase, weddingId);
  if (!access.success) return access;

  const { data, error } = await auth.data.supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("wedding_id", weddingId)
    .select("id")
    .single();

  if (error || !data) {
    return failure(error?.message ?? "Brisanje beleške nije uspelo");
  }

  revalidateApp();
  return success(data);
}
