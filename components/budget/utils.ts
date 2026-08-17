import type { BudgetItem, Vendor } from "@/types/database";

import {
  ALL_FILTER,
  BUDGET_CATEGORY_COLORS,
  BUDGET_CATEGORY_LABELS,
  FALLBACK_CATEGORY_COLOR,
} from "./constants";
import type {
  BudgetFilters,
  BudgetSort,
  BudgetSortKey,
  BudgetSummary,
  CategoryDatum,
} from "./types";

export const NO_VENDOR_FILTER = "none";

function isKnownCategory(
  value: string,
): value is keyof typeof BUDGET_CATEGORY_LABELS {
  return value in BUDGET_CATEGORY_LABELS;
}

/** Kategorija je slobodan tekst u bazi, zato nepoznate vrednosti prikazujemo bez prevoda. */
export function categoryLabel(category: string): string {
  return isKnownCategory(category) ? BUDGET_CATEGORY_LABELS[category] : category;
}

export function categoryColor(category: string): string {
  return isKnownCategory(category)
    ? BUDGET_CATEGORY_COLORS[category]
    : FALLBACK_CATEGORY_COLOR;
}

export function itemTitle(item: BudgetItem): string {
  const description = item.description?.trim();
  return description && description.length > 0
    ? description
    : categoryLabel(item.category);
}

/** Dok stvarni trošak nije poznat, obavezu računamo po planiranom iznosu. */
export function itemCommitment(item: BudgetItem): number {
  const actual = Number(item.actual_amount);
  return actual > 0 ? actual : Number(item.planned_amount);
}

export function itemRemaining(item: BudgetItem): number {
  return Math.max(itemCommitment(item) - Number(item.paid_amount), 0);
}

export function paymentProgress(item: BudgetItem): number {
  const commitment = itemCommitment(item);
  if (commitment <= 0) return 0;
  return Math.min((Number(item.paid_amount) / commitment) * 100, 100);
}

export function isFullyPaid(item: BudgetItem): boolean {
  const commitment = itemCommitment(item);
  return commitment > 0 && Number(item.paid_amount) >= commitment;
}

export function summarize(items: BudgetItem[]): BudgetSummary {
  return items.reduce<BudgetSummary>(
    (summary, item) => ({
      planned: summary.planned + Number(item.planned_amount),
      actual: summary.actual + Number(item.actual_amount),
      paid: summary.paid + Number(item.paid_amount),
      deposit: summary.deposit + Number(item.deposit_amount),
      remaining: summary.remaining + itemRemaining(item),
      itemCount: summary.itemCount + 1,
      paidCount: summary.paidCount + (isFullyPaid(item) ? 1 : 0),
    }),
    {
      planned: 0,
      actual: 0,
      paid: 0,
      deposit: 0,
      remaining: 0,
      itemCount: 0,
      paidCount: 0,
    },
  );
}

export function groupByCategory(items: BudgetItem[]): CategoryDatum[] {
  const grouped = new Map<string, CategoryDatum>();

  for (const item of items) {
    const current = grouped.get(item.category) ?? {
      key: item.category,
      label: categoryLabel(item.category),
      color: categoryColor(item.category),
      planned: 0,
      actual: 0,
      paid: 0,
      remaining: 0,
      itemCount: 0,
    };

    current.planned += Number(item.planned_amount);
    current.actual += Number(item.actual_amount);
    current.paid += Number(item.paid_amount);
    current.remaining += itemRemaining(item);
    current.itemCount += 1;
    grouped.set(item.category, current);
  }

  return [...grouped.values()].sort((a, b) => b.planned - a.planned);
}

export function vendorNames(vendors: Vendor[]): Map<string, string> {
  return new Map(vendors.map((vendor) => [vendor.id, vendor.company_name]));
}

export function filterItems(
  items: BudgetItem[],
  filters: BudgetFilters,
  names: Map<string, string>,
): BudgetItem[] {
  const query = filters.search.trim().toLocaleLowerCase("sr-RS");

  return items.filter((item) => {
    if (filters.category !== ALL_FILTER && item.category !== filters.category) {
      return false;
    }

    if (filters.status !== ALL_FILTER && item.status !== filters.status) {
      return false;
    }

    if (filters.vendor === NO_VENDOR_FILTER && item.vendor_id !== null) {
      return false;
    }

    if (
      filters.vendor !== ALL_FILTER &&
      filters.vendor !== NO_VENDOR_FILTER &&
      item.vendor_id !== filters.vendor
    ) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    const vendorName = item.vendor_id ? names.get(item.vendor_id) : null;
    const haystack = [
      item.description,
      categoryLabel(item.category),
      item.category,
      item.notes,
      vendorName,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLocaleLowerCase("sr-RS");

    return haystack.includes(query);
  });
}

function sortValue(item: BudgetItem, key: BudgetSortKey): number | string {
  switch (key) {
    case "category":
      return categoryLabel(item.category).toLocaleLowerCase("sr-RS");
    case "planned":
      return Number(item.planned_amount);
    case "actual":
      return Number(item.actual_amount);
    case "paid":
      return Number(item.paid_amount);
    case "remaining":
      return itemRemaining(item);
    case "due_date":
      return item.due_date ?? "9999-12-31";
  }
}

export function sortItems(items: BudgetItem[], sort: BudgetSort): BudgetItem[] {
  const factor = sort.direction === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    const a = sortValue(left, sort.key);
    const b = sortValue(right, sort.key);

    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b, "sr-RS") * factor;
    }
    return (Number(a) - Number(b)) * factor;
  });
}

export function hasActiveFilters(filters: BudgetFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.category !== ALL_FILTER ||
    filters.status !== ALL_FILTER ||
    filters.vendor !== ALL_FILTER
  );
}

export const emptyFilters: BudgetFilters = {
  search: "",
  category: ALL_FILTER,
  status: ALL_FILTER,
  vendor: ALL_FILTER,
};
