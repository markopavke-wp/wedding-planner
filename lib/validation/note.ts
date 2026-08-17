import { z } from "zod";

import { nullableStringSchema, uuidSchema } from "./common";

export const noteCreateSchema = z.object({
  wedding_id: uuidSchema,
  title: z.string().trim().min(1).max(200),
  content: nullableStringSchema.optional(),
  category: nullableStringSchema.optional(),
});

export const noteUpdateSchema = noteCreateSchema
  .omit({ wedding_id: true })
  .partial()
  .extend({
    id: uuidSchema,
    wedding_id: uuidSchema,
  });

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
