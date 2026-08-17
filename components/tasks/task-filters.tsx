"use client";

import { Search, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Profile } from "@/types/database";

import {
  ALL_FILTER,
  TASK_PRIORITY_ORDER,
  TASK_PRIORITY_SHORT_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
  UNASSIGNED_FILTER,
} from "./constants";
import type { TaskFilters as TaskFiltersState, TaskSortKey } from "./types";

const SORT_LABELS: Record<TaskSortKey, string> = {
  deadline: "Sortiraj: po roku",
  priority: "Sortiraj: po prioritetu",
  title: "Sortiraj: po naslovu",
  created_at: "Sortiraj: najnoviji",
};

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onFiltersChange: (filters: TaskFiltersState) => void;
  onReset: () => void;
  showReset: boolean;
  showStatusFilter: boolean;
  profiles: Profile[];
  overdueCount: number;
}

export function TaskFilters({
  filters,
  onFiltersChange,
  onReset,
  showReset,
  showStatusFilter,
  profiles,
  overdueCount,
}: TaskFiltersProps) {
  return (
    <div className="card-premium space-y-3 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-2">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            className="pl-9"
            placeholder="Pretraga po naslovu, opisu ili zaduženoj osobi..."
            aria-label="Pretraga zadataka"
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ ...filters, search: event.target.value })
            }
          />
        </div>

        {showStatusFilter ? (
          <Select
            aria-label="Filter po statusu"
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({ ...filters, status: event.target.value })
            }
          >
            <option value={ALL_FILTER}>Svi statusi</option>
            {TASK_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        ) : null}

        <Select
          aria-label="Filter po prioritetu"
          value={filters.priority}
          onChange={(event) =>
            onFiltersChange({ ...filters, priority: event.target.value })
          }
        >
          <option value={ALL_FILTER}>Svi prioriteti</option>
          {TASK_PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_SHORT_LABELS[priority]}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter po zaduženoj osobi"
          value={filters.assignee}
          onChange={(event) =>
            onFiltersChange({ ...filters, assignee: event.target.value })
          }
        >
          <option value={ALL_FILTER}>Sve osobe</option>
          <option value={UNASSIGNED_FILTER}>Bez zaduženja</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.full_name || profile.email || "Član tima"}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Sortiranje zadataka"
          value={filters.sort}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              sort: event.target.value as TaskSortKey,
            })
          }
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={filters.onlyOverdue ? "default" : "outline"}
          size="sm"
          aria-pressed={filters.onlyOverdue}
          onClick={() =>
            onFiltersChange({ ...filters, onlyOverdue: !filters.onlyOverdue })
          }
        >
          <TriangleAlert className="mr-2 h-4 w-4" aria-hidden="true" />
          Samo zakasneli ({overdueCount})
        </Button>

        {showReset ? (
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Poništi filtere
          </Button>
        ) : null}
      </div>
    </div>
  );
}
