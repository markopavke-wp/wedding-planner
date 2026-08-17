import { z } from "zod";

import {
  moneySchema,
  nullableStringSchema,
  optionalDateStringSchema,
  uuidSchema,
} from "./common";

export const budgetStatusSchema = z.enum([
  "planned",
  "deposit_paid",
  "partially_paid",
  "paid",
]);

export const budgetCategories = [
  "venue",
  "food",
  "drinks",
  "photography",
  "video",
  "music",
  "decoration",
  "flowers",
  "dress",
  "suit",
  "rings",
  "invitations",
  "transport",
  "accommodation",
  "gifts",
  "other",
] as const;

export const budgetCreateSchema = z.object({
  wedding_id: uuidSchema,
  category: z.string().trim().min(1).max(100),
  description: nullableStringSchema.optional(),
  planned_amount: moneySchema.optional(),
  actual_amount: moneySchema.optional(),
  paid_amount: moneySchema.optional(),
  deposit_amount: moneySchema.optional(),
  due_date: optionalDateStringSchema.optional(),
  status: budgetStatusSchema.optional(),
  vendor_id: uuidSchema.nullable().optional(),
  notes: nullableStringSchema.optional(),
});

export const budgetUpdateSchema = budgetCreateSchema
  .omit({ wedding_id: true })
  .partial()
  .extend({
    id: uuidSchema,
    wedding_id: uuidSchema,
  });

export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;
export type BudgetUpdateInput = z.infer<typeof budgetUpdateSchema>;
export type BudgetCategory = (typeof budgetCategories)[number];
