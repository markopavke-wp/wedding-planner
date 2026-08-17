import type {
  GuestSide,
  InvitationStatus,
  TableShape,
  TableSide,
} from "@/types/database";

export const TABLE_SHAPES: readonly TableShape[] = [
  "round",
  "rectangular",
  "head_table",
];

export const TABLE_SIDES: readonly TableSide[] = ["bride", "groom", "mixed"];

export const TABLE_SHAPE_LABELS: Record<TableShape, string> = {
  round: "Okrugli",
  rectangular: "Pravougaoni",
  head_table: "Glavni sto",
};

export const TABLE_SIDE_LABELS: Record<TableSide, string> = {
  bride: "Mladina strana",
  groom: "Mladoženjina strana",
  mixed: "Mešovito",
};

export const GUEST_SIDE_LABELS: Record<GuestSide, string> = {
  bride: "Mlada",
  groom: "Mladoženja",
  bride_parents: "Mladini roditelji",
  groom_parents: "Mladoženjini roditelji",
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđen",
  declined: "Odbio",
};

export const NO_SIDE_LABEL = "Bez strane";

export const MIN_TABLE_CAPACITY = 1;
export const MAX_TABLE_CAPACITY = 30;

/** Rotacija se menja u koracima od 15° da bi plan sale ostao pravilan. */
export const ROTATION_STEP = 15;

export function tableSideLabel(side: TableSide | null): string {
  return side === null ? NO_SIDE_LABEL : TABLE_SIDE_LABELS[side];
}

export function normalizeRotation(value: number): number {
  const wrapped = Math.round(value) % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}
