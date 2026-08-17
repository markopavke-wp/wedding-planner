"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Loader,
  Pencil,
  Trash2,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { BudgetItem } from "@/types/database";

import { BUDGET_STATUS_BADGE_CLASSES, BUDGET_STATUS_LABELS } from "./constants";
import { formatDueDate, formatMoney, formatPercentValue } from "./format";
import type { BudgetSort, BudgetSortKey, BudgetSummary } from "./types";
import {
  categoryColor,
  categoryLabel,
  isFullyPaid,
  itemRemaining,
  itemTitle,
  paymentProgress,
} from "./utils";

interface BudgetTableProps {
  items: BudgetItem[];
  vendorNames: Map<string, string>;
  sort: BudgetSort;
  onSortChange: (key: BudgetSortKey) => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
  onMarkPaid: (item: BudgetItem) => void;
  pendingItemId: string | null;
  totals: BudgetSummary;
  isFiltered: boolean;
  onCreate: () => void;
  onResetFilters: () => void;
}

interface SortHeaderProps {
  column: BudgetSortKey;
  label: string;
  sort: BudgetSort;
  onSortChange: (key: BudgetSortKey) => void;
  align?: "left" | "right";
}

function SortHeader({
  column,
  label,
  sort,
  onSortChange,
  align = "left",
}: SortHeaderProps) {
  const isActive = sort.key === column;
  const Icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className={cn("px-3 py-3 font-medium", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={() => onSortChange(column)}
        aria-label={`Sortiraj po: ${label}`}
        className={cn(
          "inline-flex items-center gap-1.5 transition hover:text-foreground",
          align === "right" && "flex-row-reverse",
          isActive && "text-foreground",
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}

export function BudgetTable({
  items,
  vendorNames,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onMarkPaid,
  pendingItemId,
  totals,
  isFiltered,
  onCreate,
  onResetFilters,
}: BudgetTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <WalletCards className="mx-auto mb-3 h-8 w-8 text-muted" aria-hidden="true" />
        {isFiltered ? (
          <>
            <p className="text-muted">Nijedna stavka ne odgovara zadatim filterima.</p>
            <Button variant="outline" className="mt-4" onClick={onResetFilters}>
              Poništi filtere
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted">
              Još nema stavki budžeta. Dodajte prvi trošak i pratite plan.
            </p>
            <Button className="mt-4" onClick={onCreate}>
              Dodaj prvu stavku
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <SortHeader
              column="category"
              label="Stavka"
              sort={sort}
              onSortChange={onSortChange}
            />
            <th className="px-3 py-3 font-medium">Dobavljač</th>
            <SortHeader
              column="due_date"
              label="Rok"
              sort={sort}
              onSortChange={onSortChange}
            />
            <SortHeader
              column="planned"
              label="Planirano"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
            <SortHeader
              column="actual"
              label="Stvarno"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
            <SortHeader
              column="paid"
              label="Plaćeno"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
            <SortHeader
              column="remaining"
              label="Preostalo"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 text-right font-medium">Akcije</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const vendorName = item.vendor_id
              ? vendorNames.get(item.vendor_id) ?? null
              : null;
            const remaining = itemRemaining(item);
            const progress = paymentProgress(item);
            const fullyPaid = isFullyPaid(item);
            const isPending = pendingItemId === item.id;

            return (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border/70 align-top last:border-0",
                  isPending && "opacity-60",
                )}
              >
                <td className="px-3 py-4">
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: categoryColor(item.category) }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{itemTitle(item)}</p>
                      <p className="text-xs text-muted">
                        {categoryLabel(item.category)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4 text-muted">{vendorName ?? "—"}</td>

                <td className="px-3 py-4 text-muted">{formatDueDate(item.due_date)}</td>

                <td className="px-3 py-4 text-right tabular-nums">
                  {formatMoney(Number(item.planned_amount))}
                </td>

                <td className="px-3 py-4 text-right tabular-nums">
                  {Number(item.actual_amount) > 0
                    ? formatMoney(Number(item.actual_amount))
                    : "—"}
                </td>

                <td className="px-3 py-4 text-right">
                  <p className="tabular-nums">{formatMoney(Number(item.paid_amount))}</p>
                  <div className="mt-1.5 flex items-center justify-end gap-2">
                    <Progress value={progress} className="h-1.5 w-16" />
                    <span className="text-xs text-muted">
                      {formatPercentValue(progress)}
                    </span>
                  </div>
                  {Number(item.deposit_amount) > 0 ? (
                    <p className="mt-1 text-xs text-muted">
                      Kapara: {formatMoney(Number(item.deposit_amount))}
                    </p>
                  ) : null}
                </td>

                <td
                  className={cn(
                    "px-3 py-4 text-right tabular-nums",
                    remaining > 0 && "font-medium",
                  )}
                >
                  {formatMoney(remaining)}
                </td>

                <td className="px-3 py-4">
                  <Badge className={BUDGET_STATUS_BADGE_CLASSES[item.status]}>
                    {BUDGET_STATUS_LABELS[item.status]}
                  </Badge>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {isPending ? (
                      <Loader
                        className="mr-1 h-4 w-4 animate-spin text-muted"
                        aria-label="Čuvanje u toku"
                      />
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Označi kao plaćeno: ${itemTitle(item)}`}
                      title="Označi kao plaćeno"
                      disabled={fullyPaid || isPending}
                      onClick={() => onMarkPaid(item)}
                    >
                      <Check className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Izmeni stavku: ${itemTitle(item)}`}
                      title="Izmeni"
                      disabled={isPending}
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Obriši stavku: ${itemTitle(item)}`}
                      title="Obriši"
                      disabled={isPending}
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot className="border-t border-border font-medium">
          <tr>
            <td className="px-3 py-4" colSpan={3}>
              Ukupno ({items.length})
            </td>
            <td className="px-3 py-4 text-right tabular-nums">
              {formatMoney(totals.planned)}
            </td>
            <td className="px-3 py-4 text-right tabular-nums">
              {formatMoney(totals.actual)}
            </td>
            <td className="px-3 py-4 text-right tabular-nums">
              {formatMoney(totals.paid)}
            </td>
            <td className="px-3 py-4 text-right tabular-nums">
              {formatMoney(totals.remaining)}
            </td>
            <td className="px-3 py-4" colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
