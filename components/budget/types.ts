export type BudgetSortKey =
  | "category"
  | "planned"
  | "actual"
  | "paid"
  | "remaining"
  | "due_date";

export type SortDirection = "asc" | "desc";

export interface BudgetSort {
  key: BudgetSortKey;
  direction: SortDirection;
}

export interface BudgetFilters {
  search: string;
  /** Vrednost kategorije ili `all`. */
  category: string;
  /** `BudgetStatus` ili `all`. */
  status: string;
  /** Id dobavljača, `none` za stavke bez dobavljača ili `all`. */
  vendor: string;
}

export interface BudgetSummary {
  planned: number;
  actual: number;
  paid: number;
  deposit: number;
  remaining: number;
  itemCount: number;
  paidCount: number;
}

export interface CategoryDatum {
  key: string;
  label: string;
  color: string;
  planned: number;
  actual: number;
  paid: number;
  remaining: number;
  itemCount: number;
}
