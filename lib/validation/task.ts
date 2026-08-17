import { z } from "zod";

import {
  nullableStringSchema,
  optionalDateStringSchema,
  uuidSchema,
} from "./common";

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const taskStatusSchema = z.enum(["todo", "in_progress", "completed"]);

export const taskCreateSchema = z.object({
  wedding_id: uuidSchema,
  title: z.string().trim().min(1).max(200),
  description: nullableStringSchema.optional(),
  category: nullableStringSchema.optional(),
  deadline: optionalDateStringSchema.optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  assigned_to: uuidSchema.nullable().optional(),
});

export const taskUpdateSchema = taskCreateSchema
  .omit({ wedding_id: true })
  .partial()
  .extend({
    id: uuidSchema,
    wedding_id: uuidSchema,
  });

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
