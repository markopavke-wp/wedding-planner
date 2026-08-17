export const CHART_COLORS = {
  accent: "#be123c",
  accentSoft: "#fb7185",
  rose: "#f9a8d4",
  stone: "#78716c",
  stoneDark: "#44403c",
  stoneLight: "#d6d3d1",
  success: "#15803d",
  warning: "#b45309",
} as const;

/** Redosled boja za serije bez semantičkog značenja (npr. kategorije budžeta). */
export const CHART_SERIES = [
  CHART_COLORS.accent,
  CHART_COLORS.accentSoft,
  CHART_COLORS.stoneDark,
  CHART_COLORS.warning,
  CHART_COLORS.stone,
  CHART_COLORS.rose,
  CHART_COLORS.success,
  CHART_COLORS.stoneLight,
] as const;

export const INVITATION_COLORS = {
  confirmed: CHART_COLORS.success,
  pending: CHART_COLORS.warning,
  declined: CHART_COLORS.stone,
} as const;

export const AXIS_TICK = { fontSize: 12, fill: "var(--muted)" } as const;
export const GRID_STROKE = "var(--border)";
