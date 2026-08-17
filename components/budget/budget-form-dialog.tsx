"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BUDGET_CURRENCIES,
  EUR_TO_RSD,
  formatDualMoney,
  type BudgetCurrency,
} from "@/lib/currency";
import type { BudgetItem, Vendor } from "@/types/database";

import {
  BUDGET_CATEGORIES,
  BUDGET_STATUS_LABELS,
  BUDGET_STATUS_ORDER,
} from "./constants";
import {
  amountToInput,
  BUDGET_CURRENCY_LABELS,
  budgetFormDefaults,
  budgetFormSchema,
  currencyUnitLabel,
  parseAmount,
  toBudgetPayload,
  type BudgetFormValues,
  type BudgetPayload,
} from "./schema";
import { categoryLabel } from "./utils";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BudgetItem | null;
  vendors: Vendor[];
  onSubmit: (payload: BudgetPayload) => Promise<boolean>;
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  wide,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

function itemToFormValues(item: BudgetItem): BudgetFormValues {
  const currency: BudgetCurrency = item.currency ?? "rsd";

  return {
    category: item.category,
    description: item.description ?? "",
    currency,
    planned_amount: amountToInput(item.planned_amount, currency),
    actual_amount: amountToInput(item.actual_amount, currency),
    paid_amount: amountToInput(item.paid_amount, currency),
    deposit_amount: amountToInput(item.deposit_amount, currency),
    due_date: item.due_date ?? "",
    status: item.status,
    vendor_id: item.vendor_id ?? "",
    notes: item.notes ?? "",
  };
}

function ConversionHint({
  amount,
  currency,
}: {
  amount: string;
  currency: BudgetCurrency;
}) {
  const parsed = parseAmount(amount);
  if (parsed <= 0) return null;

  const rsd =
    currency === "eur" ? parsed * EUR_TO_RSD : parsed;
  return (
    <p className="mt-1 text-xs text-muted">
      U bazi / na prikazu: {formatDualMoney(rsd)} (kurs {EUR_TO_RSD} RSD = 1 €)
    </p>
  );
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  item,
  vendors,
  onSubmit,
}: BudgetFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budgetFormDefaults,
  });

  const currency = useWatch({ control, name: "currency" }) ?? "rsd";
  const plannedAmount = useWatch({ control, name: "planned_amount" }) ?? "";
  const unit = currencyUnitLabel(currency);

  useEffect(() => {
    if (!open) return;
    reset(item ? itemToFormValues(item) : budgetFormDefaults);
  }, [item, open, reset]);

  const knownCategories: readonly string[] = BUDGET_CATEGORIES;
  const categoryOptions =
    item && !knownCategories.includes(item.category)
      ? [item.category, ...knownCategories]
      : [...knownCategories];

  function handleCurrencyChange(next: BudgetCurrency) {
    const current = getValues("currency");
    if (current === next) return;

    // Iznosi u poljima se konvertuju da korisnik vidi istu stvarnu vrednost.
    const fields = [
      "planned_amount",
      "actual_amount",
      "paid_amount",
      "deposit_amount",
    ] as const;

    for (const field of fields) {
      const raw = getValues(field);
      const parsed = parseAmount(raw);
      if (parsed <= 0) continue;

      const inRsd =
        current === "eur" ? parsed * EUR_TO_RSD : parsed;
      const converted =
        next === "eur" ? inRsd / EUR_TO_RSD : inRsd;
      setValue(field, String(Math.round(converted * 100) / 100), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setValue("currency", next, { shouldDirty: true, shouldValidate: true });
  }

  const submit = handleSubmit(async (values) => {
    const saved = await onSubmit(toBudgetPayload(values));
    if (saved) {
      onOpenChange(false);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={item ? "Izmeni stavku budžeta" : "Nova stavka budžeta"}
      className="max-w-3xl"
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field
          label="Kategorija *"
          htmlFor="budget-category"
          error={errors.category?.message}
        >
          <Select id="budget-category" {...register("category")}>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status" htmlFor="budget-status" error={errors.status?.message}>
          <Select id="budget-status" {...register("status")}>
            {BUDGET_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {BUDGET_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Opis"
          htmlFor="budget-description"
          error={errors.description?.message}
          hint="npr. Iznajmljivanje sale sa dekoracijom"
        >
          <Input id="budget-description" autoFocus {...register("description")} />
        </Field>

        <Field
          label="Dobavljač"
          htmlFor="budget-vendor"
          error={errors.vendor_id?.message}
          hint={vendors.length === 0 ? "Još nema unetih dobavljača." : undefined}
        >
          <Select id="budget-vendor" {...register("vendor_id")}>
            <option value="">Bez dobavljača</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.company_name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Valuta unosa *"
          htmlFor="budget-currency"
          error={errors.currency?.message}
          hint={`Kurs: 1 € = ${EUR_TO_RSD} RSD. Prikaz svuda ide u obe valute.`}
          wide
        >
          <Select
            id="budget-currency"
            value={currency}
            onChange={(event) =>
              handleCurrencyChange(event.target.value as BudgetCurrency)
            }
          >
            {BUDGET_CURRENCIES.map((option) => (
              <option key={option} value={option}>
                {BUDGET_CURRENCY_LABELS[option]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={`Planirani iznos (${unit}) *`}
          htmlFor="budget-planned"
          error={errors.planned_amount?.message}
        >
          <Input
            id="budget-planned"
            inputMode="decimal"
            placeholder="0"
            {...register("planned_amount")}
          />
          <ConversionHint amount={plannedAmount} currency={currency} />
        </Field>

        <Field
          label={`Stvarni iznos (${unit})`}
          htmlFor="budget-actual"
          error={errors.actual_amount?.message}
          hint="Ostavite prazno dok trošak nije poznat."
        >
          <Input
            id="budget-actual"
            inputMode="decimal"
            placeholder="0"
            {...register("actual_amount")}
          />
        </Field>

        <Field
          label={`Plaćeno (${unit})`}
          htmlFor="budget-paid"
          error={errors.paid_amount?.message}
        >
          <Input
            id="budget-paid"
            inputMode="decimal"
            placeholder="0"
            {...register("paid_amount")}
          />
        </Field>

        <Field
          label={`Kapara (${unit})`}
          htmlFor="budget-deposit"
          error={errors.deposit_amount?.message}
        >
          <Input
            id="budget-deposit"
            inputMode="decimal"
            placeholder="0"
            {...register("deposit_amount")}
          />
        </Field>

        <Field
          label="Rok plaćanja"
          htmlFor="budget-due-date"
          error={errors.due_date?.message}
        >
          <Input id="budget-due-date" type="date" {...register("due_date")} />
        </Field>

        <Field label="Napomena" htmlFor="budget-notes" error={errors.notes?.message} wide>
          <Textarea id="budget-notes" {...register("notes")} />
        </Field>

        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Otkaži
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Čuvanje..." : "Sačuvaj"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
