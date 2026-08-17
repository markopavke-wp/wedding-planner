import { z } from "zod";

import { nullableStringSchema, uuidSchema } from "./common";

export const tableShapeSchema = z.enum(["round", "rectangular", "head_table"]);
export const tableSideSchema = z.enum(["bride", "groom", "mixed"]);

export const tableCreateSchema = z.object({
  wedding_id: uuidSchema,
  name: z.string().trim().min(1).max(100),
  capacity: z.number().int().min(1).max(100),
  shape: tableShapeSchema.optional(),
  position_x: z.number().finite().optional(),
  position_y: z.number().finite().optional(),
  width: z.number().finite().nullable().optional(),
  height: z.number().finite().nullable().optional(),
  rotation: z.number().finite().optional(),
  side: tableSideSchema.nullable().optional(),
  notes: nullableStringSchema.optional(),
});

export const tableUpdateSchema = tableCreateSchema
  .omit({ wedding_id: true })
  .partial()
  .extend({
    id: uuidSchema,
    wedding_id: uuidSchema,
  });

export const tablePositionSchema = z.object({
  id: uuidSchema,
  wedding_id: uuidSchema,
  position_x: z.number().finite(),
  position_y: z.number().finite(),
  rotation: z.number().finite().optional(),
});

export const tableSideBatchSchema = z.object({
  wedding_id: uuidSchema,
  assignments: z
    .array(
      z.object({
        id: uuidSchema,
        side: tableSideSchema.nullable(),
      }),
    )
    .min(1),
});

export type TableCreateInput = z.infer<typeof tableCreateSchema>;
export type TableUpdateInput = z.infer<typeof tableUpdateSchema>;
