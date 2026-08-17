import { budgetCategories, type BudgetCategory } from "@/lib/validation/budget";
import type { BudgetStatus } from "@/types/database";

export const BUDGET_CATEGORIES = budgetCategories;

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue: "Prostor i sala",
  food: "Hrana i ketering",
  drinks: "Piće",
  photography: "Fotografija",
  video: "Video snimanje",
  music: "Muzika i zabava",
  decoration: "Dekoracija",
  flowers: "Cveće",
  dress: "Venčanica",
  suit: "Odelo",
  rings: "Prstenje",
  invitations: "Pozivnice i štampa",
  transport: "Prevoz",
  accommodation: "Smeštaj",
  gifts: "Pokloni",
  other: "Ostalo",
};

/** Paleta je usklađena sa grafikonima na kontrolnoj tabli. */
export const BUDGET_CATEGORY_COLORS: Record<BudgetCategory, string> = {
  venue: "#be123c",
  food: "#d9a441",
  drinks: "#c9705f",
  photography: "#8895b0",
  video: "#7fa88b",
  music: "#9a6fb0",
  decoration: "#e5879f",
  flowers: "#b08968",
  dress: "#a8a29e",
  suit: "#6b7280",
  rings: "#b58a3c",
  invitations: "#7c9885",
  transport: "#7e7ba6",
  accommodation: "#a86f6f",
  gifts: "#cf8b6c",
  other: "#a8a29e",
};

export const FALLBACK_CATEGORY_COLOR = "#a8a29e";

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  planned: "Planirano",
  deposit_paid: "Kapara plaćena",
  partially_paid: "Delimično plaćeno",
  paid: "Plaćeno",
};

export const BUDGET_STATUS_ORDER: BudgetStatus[] = [
  "planned",
  "deposit_paid",
  "partially_paid",
  "paid",
];

export const BUDGET_STATUS_BADGE_CLASSES: Record<BudgetStatus, string> = {
  planned: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
  deposit_paid: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  partially_paid: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export const PLANNED_SERIES_COLOR = "#f3b6c2";
export const ACTUAL_SERIES_COLOR = "#be123c";
export const PAID_SERIES_COLOR = "#7fa88b";
export const REMAINING_SERIES_COLOR = "#d9a441";

export const CHART_TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: 12,
  boxShadow: "0 12px 32px rgb(28 25 23 / 10%)",
} as const;

export const ALL_FILTER = "all";
