import { z } from "zod";

import {
  BUDGET_CURRENCY_LABELS,
  fromRsd,
  toRsd,
  type BudgetCurrency,
} from "@/lib/currency";
import type { BudgetStatus } from "@/types/database";

const AMOUNT_PATTERN = /^\d+([.,]\d{1,2})?$/;
const AMOUNT_MESSAGE = "Unesite ispravan iznos (npr. 1500 ili 1500,50)";

/** Forma radi sa string vrednostima iz `<input>` polja, konverziju radi `toBudgetPayload`. */
const amountField = z
  .string()
  .trim()
  .refine((value) => value === "" || AMOUNT_PATTERN.test(value), AMOUNT_MESSAGE);

const requiredAmountField = z
  .string()
  .trim()
  .min(1, "Planirani iznos je obavezan")
  .regex(AMOUNT_PATTERN, AMOUNT_MESSAGE);

export function parseAmount(value: string): number {
  if (value.trim() === "") return 0;
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export const budgetFormSchema = z
  .object({
    category: z.string().trim().min(1, "Kategorija je obavezna").max(100),
    description: z.string().trim().max(200, "Opis može imati najviše 200 znakova"),
    currency: z.enum(["eur", "rsd"]),
    planned_amount: requiredAmountField,
    actual_amount: amountField,
    paid_amount: amountField,
    deposit_amount: amountField,
    due_date: z
      .string()
      .refine(
        (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
        "Datum mora biti u formatu YYYY-MM-DD",
      ),
    status: z.enum(["planned", "deposit_paid", "partially_paid", "paid"]),
    vendor_id: z.string(),
    notes: z.string().trim().max(2000, "Napomena je predugačka"),
  })
  .superRefine((values, context) => {
    const planned = parseAmount(values.planned_amount);
    const actual = parseAmount(values.actual_amount);
    const paid = parseAmount(values.paid_amount);
    const deposit = parseAmount(values.deposit_amount);
    const commitment = actual > 0 ? actual : planned;

    if (commitment > 0 && paid > commitment) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paid_amount"],
        message:
          "Plaćeni iznos ne može biti veći od stvarnog (ili planiranog) troška",
      });
    }

    if (deposit > 0 && paid > 0 && deposit > paid) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deposit_amount"],
        message: "Kapara je deo plaćenog iznosa i ne može biti veća od njega",
      });
    }
  });

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export const budgetFormDefaults: BudgetFormValues = {
  category: "venue",
  description: "",
  currency: "rsd",
  planned_amount: "",
  actual_amount: "",
  paid_amount: "",
  deposit_amount: "",
  due_date: "",
  status: "planned",
  vendor_id: "",
  notes: "",
};

export interface BudgetPayload {
  category: string;
  description: string | null;
  planned_amount: number;
  actual_amount: number;
  paid_amount: number;
  deposit_amount: number;
  currency: BudgetCurrency;
  due_date: string | null;
  status: BudgetStatus;
  vendor_id: string | null;
  notes: string | null;
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Iznose iz forme pretvara u RSD za bazu. Ako je valuta EUR, množi se kursom 118.
 */
export function toBudgetPayload(values: BudgetFormValues): BudgetPayload {
  const currency = values.currency;

  return {
    category: values.category.trim(),
    description: nullableText(values.description),
    planned_amount: toRsd(parseAmount(values.planned_amount), currency),
    actual_amount: toRsd(parseAmount(values.actual_amount), currency),
    paid_amount: toRsd(parseAmount(values.paid_amount), currency),
    deposit_amount: toRsd(parseAmount(values.deposit_amount), currency),
    currency,
    due_date: values.due_date.trim() === "" ? null : values.due_date,
    status: values.status,
    vendor_id: values.vendor_id === "" ? null : values.vendor_id,
    notes: nullableText(values.notes),
  };
}

/** Za formu: kanonski RSD iznos prikaži u valuti unosa. */
export function amountToInput(
  amountRsd: number,
  currency: BudgetCurrency,
): string {
  const value = fromRsd(Number(amountRsd), currency);
  return value > 0 ? String(value) : "";
}

export function currencyUnitLabel(currency: BudgetCurrency): string {
  return currency === "eur" ? "€" : "RSD";
}

export { BUDGET_CURRENCY_LABELS };
