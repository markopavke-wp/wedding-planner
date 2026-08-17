"use client";

import { Armchair, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  INVITATION_LABELS,
  INVITATION_STATUSES,
} from "@/components/guests/guest-labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { guestFullName } from "@/lib/utils";
import type { Guest, InvitationStatus, SeatingTable } from "@/types/database";

type GuestActionsMenuProps = {
  guest: Guest;
  tables: SeatingTable[];
  disabled: boolean;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onStatusChange: (guest: Guest, status: InvitationStatus) => void;
  onAssignTable: (guest: Guest, tableId: string | null) => void;
};

export function GuestActionsMenu({
  guest,
  tables,
  disabled,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignTable,
}: GuestActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={`Radnje za gosta ${guestFullName(guest)}`}
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="max-h-96 w-60 overflow-y-auto"
      >
        <DropdownMenuItem onSelect={() => onEdit(guest)}>
          <Pencil aria-hidden />
          Izmeni podatke
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Status pozivnice</DropdownMenuLabel>
        {INVITATION_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={guest.invitation_status === status}
            onSelect={() => onStatusChange(guest, status)}
          >
            {INVITATION_LABELS[status]}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Raspored sedenja</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={guest.table_id === null}
          onSelect={() => onAssignTable(guest, null)}
        >
          <Armchair aria-hidden />
          Ukloni sa stola
        </DropdownMenuItem>
        {tables.map((table) => (
          <DropdownMenuItem
            key={table.id}
            disabled={guest.table_id === table.id}
            onSelect={() => onAssignTable(guest, table.id)}
          >
            {table.name}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onDelete(guest)}>
          <Trash2 aria-hidden />
          Obriši gosta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
