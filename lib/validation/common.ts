import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum mora biti u formatu YYYY-MM-DD");

export const optionalDateStringSchema = z
  .union([dateStringSchema, z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

export const moneySchema = z.coerce.number().finite().min(0);

export const nullableStringSchema = z
  .union([z.string(), z.null()])
  .transform((value) => {
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

/** @deprecated Koristi nullableStringSchema */
export const optionalStringSchema = z.string().trim().max(2000);

export function emptyToNull(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
