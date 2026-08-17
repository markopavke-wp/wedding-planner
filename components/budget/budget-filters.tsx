"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Vendor } from "@/types/database";

import { ALL_FILTER, BUDGET_STATUS_LABELS, BUDGET_STATUS_ORDER } from "./constants";
import type { BudgetFilters as BudgetFiltersState } from "./types";
import { categoryLabel, NO_VENDOR_FILTER } from "./utils";

interface BudgetFiltersProps {
  filters: BudgetFiltersState;
  onFiltersChange: (filters: BudgetFiltersState) => void;
  onReset: () => void;
  showReset: boolean;
  categoryOptions: string[];
  vendors: Vendor[];
}

export function BudgetFilters({
  filters,
  onFiltersChange,
  onReset,
  showReset,
  categoryOptions,
  vendors,
}: BudgetFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative xl:col-span-2">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <Input
          className="pl-9"
          placeholder="Pretraga po opisu, kategoriji ili dobavljaču..."
          aria-label="Pretraga stavki budžeta"
          value={filters.search}
          onChange={(event) =>
            onFiltersChange({ ...filters, search: event.target.value })
          }
        />
      </div>

      <Select
        aria-label="Filter po kategoriji"
        value={filters.category}
        onChange={(event) =>
          onFiltersChange({ ...filters, category: event.target.value })
        }
      >
        <option value={ALL_FILTER}>Sve kategorije</option>
        {categoryOptions.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter po statusu plaćanja"
        value={filters.status}
        onChange={(event) =>
          onFiltersChange({ ...filters, status: event.target.value })
        }
      >
        <option value={ALL_FILTER}>Svi statusi</option>
        {BUDGET_STATUS_ORDER.map((status) => (
          <option key={status} value={status}>
            {BUDGET_STATUS_LABELS[status]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter po dobavljaču"
        value={filters.vendor}
        onChange={(event) =>
          onFiltersChange({ ...filters, vendor: event.target.value })
        }
      >
        <option value={ALL_FILTER}>Svi dobavljači</option>
        <option value={NO_VENDOR_FILTER}>Bez dobavljača</option>
        {vendors.map((vendor) => (
          <option key={vendor.id} value={vendor.id}>
            {vendor.company_name}
          </option>
        ))}
      </Select>

      {showReset ? (
        <Button
          type="button"
          variant="outline"
          className="justify-center"
          onClick={onReset}
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          Poništi filtere
        </Button>
      ) : null}
    </div>
  );
}
