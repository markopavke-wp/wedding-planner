import type { TaskPriority, TaskStatus } from "@/types/database";

export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "completed"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Za uraditi",
  in_progress: "U toku",
  completed: "Završeno",
};

export const TASK_STATUS_HINTS: Record<TaskStatus, string> = {
  todo: "Zadaci koji čekaju na početak.",
  in_progress: "Zadaci na kojima se trenutno radi.",
  completed: "Sve što je izmireno i završeno.",
};

export const TASK_STATUS_COLUMN_CLASSES: Record<TaskStatus, string> = {
  todo: "border-border bg-secondary/60",
  in_progress: "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20",
  completed:
    "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20",
};

export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  todo: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export const TASK_PRIORITY_ORDER: TaskPriority[] = ["high", "medium", "low"];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Nizak prioritet",
  medium: "Srednji prioritet",
  high: "Visok prioritet",
};

export const TASK_PRIORITY_SHORT_LABELS: Record<TaskPriority, string> = {
  low: "Nizak",
  medium: "Srednji",
  high: "Visok",
};

export const TASK_PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
};

export const TASK_PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const TASK_CATEGORY_SUGGESTIONS = [
  "Ceremonija",
  "Restoran",
  "Muzika",
  "Dekoracija",
  "Fotografija",
  "Odeća",
  "Dokumentacija",
  "Pozivnice",
  "Prevoz",
  "Medeni mesec",
] as const;

export const ALL_FILTER = "all";
export const UNASSIGNED_FILTER = "unassigned";
