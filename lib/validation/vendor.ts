import { z } from "zod";

import {
  moneySchema,
  nullableStringSchema,
  optionalDateStringSchema,
  uuidSchema,
} from "./common";

export const vendorCreateSchema = z.object({
  wedding_id: uuidSchema,
  category: z.string().trim().min(1).max(100),
  company_name: z.string().trim().min(1).max(200),
  contact_person: nullableStringSchema.optional(),
  phone: nullableStringSchema.optional(),
  email: z
    .union([z.string().email(), z.literal(""), z.null()])
    .transform((value) => (value === "" ? null : value))
    .optional(),
  instagram: nullableStringSchema.optional(),
  website: z
    .union([z.string().url(), z.literal(""), z.null()])
    .transform((value) => (value === "" ? null : value))
    .optional(),
  agreed_price: moneySchema.optional(),
  deposit: moneySchema.optional(),
  remaining_amount: moneySchema.optional(),
  payment_due_date: optionalDateStringSchema.optional(),
  status: nullableStringSchema.optional(),
  notes: nullableStringSchema.optional(),
});

export const vendorUpdateSchema = vendorCreateSchema
  .omit({ wedding_id: true })
  .partial()
  .extend({
    id: uuidSchema,
    wedding_id: uuidSchema,
  });

export type VendorCreateInput = z.infer<typeof vendorCreateSchema>;
export type VendorUpdateInput = z.infer<typeof vendorUpdateSchema>;
