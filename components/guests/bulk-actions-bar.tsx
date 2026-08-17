"use client";

import { Loader2, Trash2, X } from "lucide-react";

import {
  INVITATION_LABELS,
  INVITATION_STATUSES,
} from "@/components/guests/guest-labels";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { InvitationStatus, SeatingTable } from "@/types/database";

type BulkActionsBarProps = {
  selectedCount: number;
  filteredCount: number;
  tables: SeatingTable[];
  isPending: boolean;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onAssignTable: (tableId: string | null) => void;
  onStatusChange: (status: InvitationStatus) => void;
  onDelete: () => void;
};

export function BulkActionsBar({
  selectedCount,
  filteredCount,
  tables,
  isPending,
  onSelectAllFiltered,
  onClearSelection,
  onAssignTable,
  onStatusChange,
  onDelete,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-30">
      <div className="card-premium flex flex-col gap-3 p-4 shadow-elevated lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium">Izabrano: {selectedCount}</span>

          {selectedCount < filteredCount ? (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={onSelectAllFiltered}
            >
              Izaberi svih {filteredCount}
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isPending}
          >
            <X className="size-4" aria-hidden />
            Poništi izbor
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="h-10 w-full py-0 sm:w-56"
            aria-label="Prebaci izabrane goste na sto"
            value=""
            disabled={isPending}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              onAssignTable(value === "__none__" ? null : value);
            }}
          >
            <option value="">Prebaci na sto…</option>
            <option value="__none__">Ukloni sa stola</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name} ({table.capacity} mesta)
              </option>
            ))}
          </Select>

          <Select
            className="h-10 w-full py-0 sm:w-48"
            aria-label="Promeni status pozivnice izabranim gostima"
            value=""
            disabled={isPending}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              onStatusChange(value as InvitationStatus);
            }}
          >
            <option value="">Promeni status…</option>
            {INVITATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {INVITATION_LABELS[status]}
              </option>
            ))}
          </Select>

          <Button variant="destructive" onClick={onDelete} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
            Obriši izabrane
          </Button>
        </div>
      </div>
    </div>
  );
}
