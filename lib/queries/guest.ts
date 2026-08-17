import { createClient } from "@/lib/supabase/server";
import type { Guest, InvitationStatus } from "@/types/database";

export async function getGuests(weddingId: string): Promise<Guest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGuestById(
  weddingId: string,
  guestId: string,
): Promise<Guest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("id", guestId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getGuestsByInvitationStatus(
  weddingId: string,
  status: InvitationStatus,
): Promise<Guest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("invitation_status", status)
    .order("last_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUnassignedGuests(
  weddingId: string,
): Promise<Guest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", weddingId)
    .is("table_id", null)
    .order("last_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
