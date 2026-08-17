import type { ZodError, ZodType } from "zod";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export function success<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

export function failure(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionFailure {
  return { success: false, error, fieldErrors };
}

export function fromZodError(error: ZodError): ActionFailure {
  const fieldErrors = error.flatten().fieldErrors;
  const normalized: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      normalized[key] = messages;
    }
  }

  return failure("Validacija nije uspela", normalized);
}

export async function requireUser(): Promise<
  ActionResult<{ supabase: SupabaseServerClient; user: User }>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return failure("Morate biti prijavljeni");
  }

  return success({ supabase, user });
}

export async function requireWeddingAccess(
  supabase: SupabaseServerClient,
  weddingId: string,
): Promise<ActionResult<{ weddingId: string }>> {
  const { data, error } = await supabase
    .from("wedding")
    .select("id")
    .eq("id", weddingId)
    .maybeSingle();

  if (error) {
    return failure(error.message);
  }

  if (!data) {
    return failure("Svadba nije pronađena");
  }

  return success({ weddingId: data.id });
}

export function parseInput<T>(
  schema: ZodType<T>,
  input: unknown,
): ActionResult<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }
  return success(parsed.data);
}

export type PublicTableName = keyof Database["public"]["Tables"];
