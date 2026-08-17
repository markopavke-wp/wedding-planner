import { z } from "zod";

import { nullableStringSchema, uuidSchema } from "./common";

export const guestSideSchema = z.enum([
  "bride",
  "groom",
  "bride_parents",
  "groom_parents",
]);
export const guestGroupSchema = z.enum(["family", "friends", "work", "other"]);
export const invitationStatusSchema = z.enum([
  "pending",
  "confirmed",
  "declined",
]);

export const guestCreateSchema = z.object({
  wedding_id: uuidSchema,
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  side: guestSideSchema,
  group_name: guestGroupSchema.optional(),
  invitation_status: invitationStatusSchema.optional(),
  plus_one: z.boolean().optional(),
  plus_one_name: nullableStringSchema.optional(),
  children_count: z.number().int().min(0).max(20).optional(),
  phone: nullableStringSchema.optional(),
  notes: nullableStringSchema.optional(),
  table_id: uuidSchema.nullable().optional(),
  seat_number: z.number().int().min(1).nullable().optional(),
});

export const guestUpdateSchema = guestCreateSchema
  .omit({ wedding_id: true })
  .partial()
  .extend({
    id: uuidSchema,
    wedding_id: uuidSchema,
  });

export const bulkAssignTableSchema = z.object({
  wedding_id: uuidSchema,
  guest_ids: z.array(uuidSchema).min(1),
  table_id: uuidSchema.nullable(),
});

export type GuestCreateInput = z.infer<typeof guestCreateSchema>;
export type GuestUpdateInput = z.infer<typeof guestUpdateSchema>;
