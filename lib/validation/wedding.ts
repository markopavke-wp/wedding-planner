import { z } from "zod";

import {
  dateStringSchema,
  moneySchema,
  nullableStringSchema,
  uuidSchema,
} from "./common";

export const weddingCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  wedding_date: dateStringSchema,
  venue: nullableStringSchema.optional(),
  city: nullableStringSchema.optional(),
  planned_budget: moneySchema.optional(),
  notes: nullableStringSchema.optional(),
});

export const weddingUpdateSchema = weddingCreateSchema.partial().extend({
  id: uuidSchema,
});

export type WeddingCreateInput = z.infer<typeof weddingCreateSchema>;
export type WeddingUpdateInput = z.infer<typeof weddingUpdateSchema>;
