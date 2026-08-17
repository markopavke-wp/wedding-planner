"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BudgetItem, Vendor } from "@/types/database";

import {
  BUDGET_CATEGORIES,
  BUDGET_STATUS_LABELS,
  BUDGET_STATUS_ORDER,
} from "./constants";
import {
  budgetFormDefaults,
  budgetFormSchema,
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

function amountToInput(value: number): string {
  const numeric = Number(value);
  return numeric > 0 ? String(numeric) : "";
}

function itemToFormValues(item: BudgetItem): BudgetFormValues {
  return {
    category: item.category,
    description: item.description ?? "",
    planned_amount: amountToInput(item.planned_amount),
    actual_amount: amountToInput(item.actual_amount),
    paid_amount: amountToInput(item.paid_amount),
    deposit_amount: amountToInput(item.deposit_amount),
    due_date: item.due_date ?? "",
    status: item.status,
    vendor_id: item.vendor_id ?? "",
    notes: item.notes ?? "",
  };
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budgetFormDefaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(item ? itemToFormValues(item) : budgetFormDefaults);
  }, [item, open, reset]);

  const knownCategories: readonly string[] = BUDGET_CATEGORIES;
  const categoryOptions =
    item && !knownCategories.includes(item.category)
      ? [item.category, ...knownCategories]
      : [...knownCategories];

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
          label="Planirani iznos (RSD) *"
          htmlFor="budget-planned"
          error={errors.planned_amount?.message}
        >
          <Input
            id="budget-planned"
            inputMode="decimal"
            placeholder="0"
            {...register("planned_amount")}
          />
        </Field>

        <Field
          label="Stvarni iznos (RSD)"
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
          label="Plaćeno (RSD)"
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
          label="Kapara (RSD)"
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
