import { z } from "zod";

import {
  guestGroupSchema,
  guestSideSchema,
  invitationStatusSchema,
} from "@/lib/validation/guest";
import type { Guest } from "@/types/database";

const PHONE_PATTERN = /^[0-9+\s()./-]{6,25}$/;

/**
 * Šema forme radi sa vrednostima onako kako ih vraćaju HTML polja (stringovi),
 * a `toGuestPayload` ih prevodi u oblik koji očekuje `guestCreateSchema`.
 */
export const guestFormSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, "Ime mora imati najmanje 2 karaktera.")
      .max(100, "Ime može imati najviše 100 karaktera."),
    last_name: z
      .string()
      .trim()
      .min(2, "Prezime mora imati najmanje 2 karaktera.")
      .max(100, "Prezime može imati najviše 100 karaktera."),
    side: guestSideSchema,
    group_name: guestGroupSchema,
    invitation_status: invitationStatusSchema,
    plus_one: z.boolean(),
    plus_one_name: z
      .string()
      .trim()
      .max(100, "Ime pratioca može imati najviše 100 karaktera."),
    children_count: z
      .string()
      .trim()
      .regex(/^\d{1,2}$/, "Unesite broj dece između 0 i 20.")
      .refine((value) => Number(value) <= 20, "Najviše 20 dece po gostu."),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || PHONE_PATTERN.test(value),
        "Unesite ispravan broj telefona.",
      ),
    notes: z
      .string()
      .trim()
      .max(1000, "Napomena može imati najviše 1000 karaktera."),
    table_id: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.plus_one && values.plus_one_name.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["plus_one_name"],
        message: "Označite „Dolazi sa pratiocem“ da biste uneli ime.",
      });
    }
  });

export type GuestFormValues = z.infer<typeof guestFormSchema>;

export const emptyGuestForm: GuestFormValues = {
  first_name: "",
  last_name: "",
  side: "bride",
  group_name: "family",
  invitation_status: "pending",
  plus_one: false,
  plus_one_name: "",
  children_count: "0",
  phone: "",
  notes: "",
  table_id: "",
};

export function guestToFormValues(guest: Guest): GuestFormValues {
  return {
    first_name: guest.first_name,
    last_name: guest.last_name,
    side: guest.side,
    group_name: guest.group_name,
    invitation_status: guest.invitation_status,
    plus_one: guest.plus_one,
    plus_one_name: guest.plus_one_name ?? "",
    children_count: String(guest.children_count),
    phone: guest.phone ?? "",
    notes: guest.notes ?? "",
    table_id: guest.table_id ?? "",
  };
}

export function toGuestPayload(values: GuestFormValues, weddingId: string) {
  return {
    wedding_id: weddingId,
    first_name: values.first_name,
    last_name: values.last_name,
    side: values.side,
    group_name: values.group_name,
    invitation_status: values.invitation_status,
    plus_one: values.plus_one,
    plus_one_name: values.plus_one ? values.plus_one_name : "",
    children_count: Number(values.children_count),
    phone: values.phone,
    notes: values.notes,
    table_id: values.table_id === "" ? null : values.table_id,
  };
}
