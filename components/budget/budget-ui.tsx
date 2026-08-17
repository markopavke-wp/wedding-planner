"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createBudgetItem,
  deleteBudgetItem,
  updateBudgetItem,
} from "@/lib/actions/budget";
import type { BudgetItem, Vendor } from "@/types/database";

import { BudgetCharts } from "./budget-charts";
import { BudgetFilters } from "./budget-filters";
import { BudgetFormDialog } from "./budget-form-dialog";
import { BudgetKpiCards } from "./budget-kpi-cards";
import { BudgetTable } from "./budget-table";
import { BUDGET_CATEGORIES } from "./constants";
import { formatMoney, itemCountLabel } from "./format";
import type { BudgetPayload } from "./schema";
import type { BudgetSort, BudgetSortKey } from "./types";
import {
  emptyFilters,
  filterItems,
  groupByCategory,
  hasActiveFilters,
  itemCommitment,
  itemTitle,
  sortItems,
  summarize,
  vendorNames,
} from "./utils";

interface BudgetUIProps {
  initialItems: BudgetItem[];
  vendors: Vendor[];
  weddingId: string;
  plannedBudget: number;
}

export function BudgetUI({
  initialItems,
  vendors,
  weddingId,
  plannedBudget,
}: BudgetUIProps) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState<BudgetSort>({ key: "planned", direction: "desc" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [deleting, setDeleting] = useState<BudgetItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const names = useMemo(() => vendorNames(vendors), [vendors]);
  const summary = useMemo(() => summarize(items), [items]);
  const categories = useMemo(() => groupByCategory(items), [items]);
  const filtered = useMemo(
    () => filterItems(items, filters, names),
    [filters, items, names],
  );
  const visibleItems = useMemo(() => sortItems(filtered, sort), [filtered, sort]);
  const filteredSummary = useMemo(() => summarize(filtered), [filtered]);
  const categoryOptions = useMemo(() => {
    const known: readonly string[] = BUDGET_CATEGORIES;
    const extra = items
      .map((item) => item.category)
      .filter((category) => !known.includes(category));
    return [...new Set([...known, ...extra])];
  }, [items]);
  const filtersActive = hasActiveFilters(filters);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: BudgetItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function handleSortChange(key: BudgetSortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : {
            key,
            direction: key === "category" || key === "due_date" ? "asc" : "desc",
          },
    );
  }

  async function handleSubmit(payload: BudgetPayload): Promise<boolean> {
    const toastId = toast.loading(
      editing ? "Čuvanje izmena..." : "Dodavanje stavke...",
    );

    const result = editing
      ? await updateBudgetItem({
          ...payload,
          id: editing.id,
          wedding_id: weddingId,
        })
      : await createBudgetItem({ ...payload, wedding_id: weddingId });

    if (!result.success) {
      toast.error("Stavka nije sačuvana.", {
        id: toastId,
        description: result.error,
      });
      return false;
    }

    const saved = result.data;
    setItems((current) =>
      editing
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current],
    );
    toast.success(editing ? "Stavka je izmenjena." : "Stavka je dodata.", {
      id: toastId,
    });
    return true;
  }

  async function handleDelete() {
    if (!deleting) return;

    setIsDeleting(true);
    const toastId = toast.loading("Brisanje stavke...");
    const result = await deleteBudgetItem(weddingId, deleting.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error("Stavka nije obrisana.", {
        id: toastId,
        description: result.error,
      });
      return;
    }

    setItems((current) => current.filter((item) => item.id !== deleting.id));
    setDeleting(null);
    toast.success("Stavka je obrisana.", { id: toastId });
  }

  async function handleMarkPaid(item: BudgetItem) {
    const commitment = itemCommitment(item);

    if (commitment <= 0) {
      toast.error("Unesite planirani ili stvarni iznos pre označavanja plaćanja.");
      return;
    }

    setPendingItemId(item.id);
    const toastId = toast.loading("Evidentiranje plaćanja...");
    const result = await updateBudgetItem({
      id: item.id,
      wedding_id: weddingId,
      actual_amount: commitment,
      paid_amount: commitment,
      status: "paid",
    });
    setPendingItemId(null);

    if (!result.success) {
      toast.error("Plaćanje nije evidentirano.", {
        id: toastId,
        description: result.error,
      });
      return;
    }

    const saved = result.data;
    setItems((current) =>
      current.map((existing) => (existing.id === saved.id ? saved : existing)),
    );
    toast.success(`„${itemTitle(saved)}” je označena kao plaćena.`, { id: toastId });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Finansije
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold">Budžet</h1>
          <p className="mt-2 text-sm text-muted">
            Planirano {formatMoney(summary.planned)} · Plaćeno {formatMoney(summary.paid)}{" "}
            · Preostalo {formatMoney(summary.remaining)}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Nova stavka
        </Button>
      </header>

      <BudgetKpiCards summary={summary} plannedBudget={plannedBudget} />

      <BudgetCharts categories={categories} summary={summary} />

      <Card>
        <CardHeader>
          <CardTitle>Stavke budžeta</CardTitle>
          <CardDescription>
            {filtersActive
              ? `Prikazano ${itemCountLabel(filtered.length)} od ukupno ${items.length}.`
              : "Troškovi, rokovi plaćanja i statusi po kategorijama."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <BudgetFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters(emptyFilters)}
            showReset={filtersActive}
            categoryOptions={categoryOptions}
            vendors={vendors}
          />

          <BudgetTable
            items={visibleItems}
            vendorNames={names}
            sort={sort}
            onSortChange={handleSortChange}
            onEdit={openEdit}
            onDelete={setDeleting}
            onMarkPaid={(item) => void handleMarkPaid(item)}
            pendingItemId={pendingItemId}
            totals={filteredSummary}
            isFiltered={filtersActive}
            onCreate={openCreate}
            onResetFilters={() => setFilters(emptyFilters)}
          />
        </CardContent>
      </Card>

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        vendors={vendors}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(value) => {
          if (!value) setDeleting(null);
        }}
        title="Obriši stavku budžeta?"
        description={
          deleting
            ? `Stavka „${itemTitle(deleting)}” (${formatMoney(Number(deleting.planned_amount))}) biće trajno obrisana.`
            : ""
        }
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
