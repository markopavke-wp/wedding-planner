"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Baby, Phone, UserPlus } from "lucide-react";

import { GuestActionsMenu } from "@/components/guests/guest-actions-menu";
import {
  GROUP_LABELS,
  INVITATION_BADGE_CLASSES,
  INVITATION_LABELS,
  SIDE_LABELS,
} from "@/components/guests/guest-labels";
import type {
  GuestSortKey,
  SortDirection,
} from "@/components/guests/guests-toolbar";
import { Badge } from "@/components/ui/badge";
import { cn, guestFullName, guestHeadcount } from "@/lib/utils";
import type { Guest, InvitationStatus, SeatingTable } from "@/types/database";

type GuestsTableProps = {
  guests: Guest[];
  tables: SeatingTable[];
  tableNames: Map<string, string>;
  selectedIds: Set<string>;
  allVisibleSelected: boolean;
  sortKey: GuestSortKey;
  sortDirection: SortDirection;
  isPending: boolean;
  onToggleGuest: (guestId: string, checked: boolean) => void;
  onToggleVisible: (checked: boolean) => void;
  onSortChange: (key: GuestSortKey, direction: SortDirection) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onStatusChange: (guest: Guest, status: InvitationStatus) => void;
  onAssignTable: (guest: Guest, tableId: string | null) => void;
};

function SortButton({
  label,
  sortKey,
  activeKey,
  direction,
  onSortChange,
}: {
  label: string;
  sortKey: GuestSortKey;
  activeKey: GuestSortKey;
  direction: SortDirection;
  onSortChange: (key: GuestSortKey, direction: SortDirection) => void;
}) {
  const isActive = activeKey === sortKey;
  const next: SortDirection = isActive && direction === "asc" ? "desc" : "asc";
  const Icon = isActive ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSortChange(sortKey, next)}
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
        isActive ? "text-foreground" : "text-muted",
      )}
      aria-label={`Sortiraj po: ${label}`}
    >
      {label}
      <Icon className="size-3.5" aria-hidden />
    </button>
  );
}

export function GuestsTable({
  guests,
  tables,
  tableNames,
  selectedIds,
  allVisibleSelected,
  sortKey,
  sortDirection,
  isPending,
  onToggleGuest,
  onToggleVisible,
  onSortChange,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignTable,
}: GuestsTableProps) {
  return (
    <div className="card-premium hidden overflow-hidden lg:block">
      <div className="overflow-x-auto scrollbar-slim">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted">
              <th scope="col" className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--accent)]"
                  checked={allVisibleSelected}
                  disabled={guests.length === 0}
                  onChange={(event) => onToggleVisible(event.target.checked)}
                  aria-label="Izaberi sve prikazane goste"
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortButton
                  label="Gost"
                  sortKey="name"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortButton
                  label="Strana"
                  sortKey="side"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortButton
                  label="Grupa"
                  sortKey="group"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortButton
                  label="Status"
                  sortKey="status"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortButton
                  label="Mesta"
                  sortKey="headcount"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortButton
                  label="Sto"
                  sortKey="table"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="hidden px-4 py-3 xl:table-cell">
                Telefon
              </th>
              <th scope="col" className="w-14 px-4 py-3 text-right">
                <span className="sr-only">Radnje</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center text-muted">
                  Nema gostiju koji odgovaraju zadatim kriterijumima.
                </td>
              </tr>
            ) : (
              guests.map((guest) => {
                const isSelected = selectedIds.has(guest.id);
                const tableName = guest.table_id
                  ? (tableNames.get(guest.table_id) ?? "Nepoznat sto")
                  : null;

                return (
                  <tr
                    key={guest.id}
                    className={cn(
                      "transition-colors",
                      isSelected ? "bg-accent-soft/60" : "hover:bg-secondary/50",
                    )}
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--accent)]"
                        checked={isSelected}
                        onChange={(event) =>
                          onToggleGuest(guest.id, event.target.checked)
                        }
                        aria-label={`Izaberi gosta ${guestFullName(guest)}`}
                      />
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <p className="font-medium">{guestFullName(guest)}</p>
                        {guest.notes ? (
                          <p className="max-w-[28ch] truncate text-xs text-muted">
                            {guest.notes}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle text-muted">
                      {SIDE_LABELS[guest.side]}
                    </td>

                    <td className="px-4 py-3 align-middle text-muted">
                      {GROUP_LABELS[guest.group_name]}
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <Badge
                        className={INVITATION_BADGE_CLASSES[guest.invitation_status]}
                      >
                        {INVITATION_LABELS[guest.invitation_status]}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-medium tabular-nums">
                          {guestHeadcount(guest)}
                        </span>
                        {guest.plus_one ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs text-muted"
                            title={guest.plus_one_name ?? "Pratilac"}
                          >
                            <UserPlus className="size-3.5" aria-hidden />
                            {guest.plus_one_name ?? "+1"}
                          </span>
                        ) : null}
                        {guest.children_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted">
                            <Baby className="size-3.5" aria-hidden />
                            {guest.children_count}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      {tableName ? (
                        <span>{tableName}</span>
                      ) : (
                        <span className="text-muted">Bez stola</span>
                      )}
                    </td>

                    <td className="hidden px-4 py-3 align-middle xl:table-cell">
                      {guest.phone ? (
                        <a
                          href={`tel:${guest.phone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
                        >
                          <Phone className="size-3.5" aria-hidden />
                          {guest.phone}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right align-middle">
                      <GuestActionsMenu
                        guest={guest}
                        tables={tables}
                        disabled={isPending}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                        onAssignTable={onAssignTable}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
