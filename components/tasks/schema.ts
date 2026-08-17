import { z } from "zod";

import type { TaskPriority, TaskStatus } from "@/types/database";

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Naslov mora imati najmanje 3 znaka")
    .max(200, "Naslov može imati najviše 200 znakova"),
  description: z.string().trim().max(2000, "Opis je predugačak"),
  category: z.string().trim().max(100, "Kategorija je predugačka"),
  deadline: z
    .string()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Datum mora biti u formatu YYYY-MM-DD",
    ),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "completed"]),
  assigned_to: z.string(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskFormDefaults: TaskFormValues = {
  title: "",
  description: "",
  category: "",
  deadline: "",
  priority: "medium",
  status: "todo",
  assigned_to: "",
};

export interface TaskPayload {
  title: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string | null;
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toTaskPayload(values: TaskFormValues): TaskPayload {
  return {
    title: values.title.trim(),
    description: nullableText(values.description),
    category: nullableText(values.category),
    deadline: values.deadline.trim() === "" ? null : values.deadline,
    priority: values.priority,
    status: values.status,
    assigned_to: values.assigned_to === "" ? null : values.assigned_to,
  };
}
