"use client";

import { Download, RotateCcw, Search } from "lucide-react";

import {
  GROUP_LABELS,
  GUEST_GROUPS,
  GUEST_SIDES,
  INVITATION_LABELS,
  INVITATION_STATUSES,
  SIDE_LABELS,
} from "@/components/guests/guest-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { GuestGroup, GuestSide, InvitationStatus, SeatingTable } from "@/types/database";

/** Preko ovoliko mesta u jednoj kategoriji prikaz se crveni kao upozorenje. */
const SEAT_WARNING_THRESHOLD = 55;

export type GuestFilters = {
  search: string;
  side: GuestSide | "all";
  status: InvitationStatus | "all";
  group: GuestGroup | "all";
  table: "all" | "assigned" | "unassigned" | string;
};

export type GuestSortKey =
  | "name"
  | "status"
  | "group"
  | "side"
  | "table"
  | "headcount";

export type SortDirection = "asc" | "desc";

export const DEFAULT_GUEST_FILTERS: GuestFilters = {
  search: "",
  side: "all",
  status: "all",
  group: "all",
  table: "all",
};

const SORT_OPTIONS: {
  value: string;
  label: string;
  key: GuestSortKey;
  direction: SortDirection;
}[] = [
  { value: "name-asc", label: "Prezime (A–Š)", key: "name", direction: "asc" },
  { value: "name-desc", label: "Prezime (Š–A)", key: "name", direction: "desc" },
  { value: "status-asc", label: "Status pozivnice", key: "status", direction: "asc" },
  { value: "side-asc", label: "Strana", key: "side", direction: "asc" },
  { value: "group-asc", label: "Grupa", key: "group", direction: "asc" },
  { value: "table-asc", label: "Sto", key: "table", direction: "asc" },
  {
    value: "headcount-desc",
    label: "Broj mesta (opadajuće)",
    key: "headcount",
    direction: "desc",
  },
];

type GuestsToolbarProps = {
  filters: GuestFilters;
  sortKey: GuestSortKey;
  sortDirection: SortDirection;
  tables: SeatingTable[];
  filteredCount: number;
  filteredHeadcount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onFilterChange: (patch: Partial<GuestFilters>) => void;
  onResetFilters: () => void;
  onSortChange: (key: GuestSortKey, direction: SortDirection) => void;
  onExport: () => void;
};

export function GuestsToolbar({
  filters,
  sortKey,
  sortDirection,
  tables,
  filteredCount,
  filteredHeadcount,
  totalCount,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
  onSortChange,
  onExport,
}: GuestsToolbarProps) {
  const sortValue =
    SORT_OPTIONS.find(
      (option) => option.key === sortKey && option.direction === sortDirection,
    )?.value ?? "name-asc";

  const isOverCapacity = filteredHeadcount > SEAT_WARNING_THRESHOLD;

  return (
    <section className="card-premium space-y-4 p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="relative lg:col-span-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            className="pl-9"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder="Pretraga po imenu, telefonu ili napomeni"
            aria-label="Pretraga gostiju"
          />
        </div>

        <Select
          className="lg:col-span-2"
          aria-label="Filter po strani"
          value={filters.side}
          onChange={(event) =>
            onFilterChange({ side: event.target.value as GuestFilters["side"] })
          }
        >
          <option value="all">Sve strane</option>
          {GUEST_SIDES.map((side) => (
            <option key={side} value={side}>
              {SIDE_LABELS[side]}
            </option>
          ))}
        </Select>

        <Select
          className="lg:col-span-2"
          aria-label="Filter po statusu pozivnice"
          value={filters.status}
          onChange={(event) =>
            onFilterChange({
              status: event.target.value as GuestFilters["status"],
            })
          }
        >
          <option value="all">Svi statusi</option>
          {INVITATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {INVITATION_LABELS[status]}
            </option>
          ))}
        </Select>

        <Select
          className="lg:col-span-2"
          aria-label="Filter po grupi"
          value={filters.group}
          onChange={(event) =>
            onFilterChange({ group: event.target.value as GuestFilters["group"] })
          }
        >
          <option value="all">Sve grupe</option>
          {GUEST_GROUPS.map((group) => (
            <option key={group} value={group}>
              {GROUP_LABELS[group]}
            </option>
          ))}
        </Select>

        <Select
          className="lg:col-span-2"
          aria-label="Filter po stolu"
          value={filters.table}
          onChange={(event) => onFilterChange({ table: event.target.value })}
        >
          <option value="all">Svi stolovi</option>
          <option value="assigned">Raspoređeni</option>
          <option value="unassigned">Bez stola</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Prikazano <span className="font-medium text-foreground">{filteredCount}</span>{" "}
          od {totalCount} gostiju
          {hasActiveFilters ? " (filtrirano)" : ""}
          <span className="mx-2" aria-hidden>
            •
          </span>
          Zauzeto{" "}
          <span
            className={cn(
              "font-medium",
              isOverCapacity ? "text-destructive" : "text-foreground",
            )}
            title={
              isOverCapacity
                ? `Prekoračen limit od ${SEAT_WARNING_THRESHOLD} mesta`
                : undefined
            }
          >
            {filteredHeadcount}
          </span>{" "}
          {filteredHeadcount === 1 ? "mesto" : "mesta"}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={onResetFilters}>
              <RotateCcw className="size-4" aria-hidden />
              Poništi filtere
            </Button>
          ) : null}

          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="size-4" aria-hidden />
            Izvezi CSV
          </Button>

          <Select
            className="h-9 w-56 py-0 text-sm"
            aria-label="Sortiranje liste gostiju"
            value={sortValue}
            onChange={(event) => {
              const option = SORT_OPTIONS.find(
                (item) => item.value === event.target.value,
              );
              if (option) onSortChange(option.key, option.direction);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </section>
  );
}
