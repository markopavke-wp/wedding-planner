import type { GuestGroup, GuestSide, InvitationStatus } from "@/types/database";

export const INVITATION_STATUSES: InvitationStatus[] = [
  "confirmed",
  "pending",
  "declined",
];

export const INVITATION_LABELS: Record<InvitationStatus, string> = {
  confirmed: "Potvrđen",
  pending: "Na čekanju",
  declined: "Odbio",
};

export const INVITATION_BADGE_CLASSES: Record<InvitationStatus, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  declined: "bg-secondary text-secondary-foreground",
};

export const GUEST_SIDES: GuestSide[] = [
  "bride",
  "groom",
  "bride_parents",
  "groom_parents",
];

export const SIDE_LABELS: Record<GuestSide, string> = {
  bride: "Mlada",
  groom: "Mladoženja",
  bride_parents: "Mladini roditelji",
  groom_parents: "Mladoženjini roditelji",
};

export const GUEST_GROUPS: GuestGroup[] = [
  "family",
  "friends",
  "work",
  "other",
];

export const GROUP_LABELS: Record<GuestGroup, string> = {
  family: "Porodica",
  friends: "Prijatelji",
  work: "Posao",
  other: "Ostalo",
};

/** Vrednost u <select> poljima koja označava „bez stola“. */
export const NO_TABLE_VALUE = "";
