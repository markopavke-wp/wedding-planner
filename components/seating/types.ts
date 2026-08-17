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

/** Boje stolova na šemi: mlada / mladoženja / mešovito. */
export const TABLE_SIDE_SURFACE_CLASSES: Record<TableSide, string> = {
  bride: "border-rose-400 bg-rose-50 dark:border-rose-400/80 dark:bg-rose-950/45",
  groom: "border-sky-500 bg-sky-50 dark:border-sky-400/80 dark:bg-sky-950/45",
  mixed:
    "border-amber-400 bg-amber-50 dark:border-amber-400/80 dark:bg-amber-950/40",
};

export const TABLE_SIDE_SWATCH_CLASSES: Record<TableSide, string> = {
  bride: "bg-rose-400",
  groom: "bg-sky-500",
  mixed: "bg-amber-400",
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
