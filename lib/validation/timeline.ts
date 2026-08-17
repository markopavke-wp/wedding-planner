import { z } from "zod";

import {
  dateStringSchema,
  nullableStringSchema,
  uuidSchema,
} from "./common";

export const timelineCreateSchema = z.object({
  wedding_id: uuidSchema,
  title: z.string().trim().min(1).max(200),
  description: nullableStringSchema.optional(),
  event_date: dateStringSchema,
  event_time: z
    .union([
      z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Vreme mora biti HH:MM"),
      z.literal(""),
      z.null(),
    ])
    .transform((value) => (value === "" ? null : value))
    .optional(),
  category: nullableStringSchema.optional(),
  completed: z.boolean().optional(),
});

export const timelineUpdateSchema = timelineCreateSchema
  .omit({ wedding_id: true })
  .partial()
  .extend({
    id: uuidSchema,
    wedding_id: uuidSchema,
  });

export type TimelineCreateInput = z.infer<typeof timelineCreateSchema>;
export type TimelineUpdateInput = z.infer<typeof timelineUpdateSchema>;
