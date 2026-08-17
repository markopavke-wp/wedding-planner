"use client";

import { Armchair, Baby, Phone, UserPlus } from "lucide-react";

import { GuestActionsMenu } from "@/components/guests/guest-actions-menu";
import {
  GROUP_LABELS,
  INVITATION_BADGE_CLASSES,
  INVITATION_LABELS,
  SIDE_LABELS,
} from "@/components/guests/guest-labels";
import { Badge } from "@/components/ui/badge";
import { cn, guestFullName, guestHeadcount } from "@/lib/utils";
import type { Guest, InvitationStatus, SeatingTable } from "@/types/database";

type GuestCardListProps = {
  guests: Guest[];
  tables: SeatingTable[];
  tableNames: Map<string, string>;
  selectedIds: Set<string>;
  isPending: boolean;
  onToggleGuest: (guestId: string, checked: boolean) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onStatusChange: (guest: Guest, status: InvitationStatus) => void;
  onAssignTable: (guest: Guest, tableId: string | null) => void;
};

export function GuestCardList({
  guests,
  tables,
  tableNames,
  selectedIds,
  isPending,
  onToggleGuest,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignTable,
}: GuestCardListProps) {
  if (guests.length === 0) {
    return (
      <div className="card-premium px-4 py-12 text-center lg:hidden">
        <p className="text-sm text-muted">
          Nema gostiju koji odgovaraju zadatim kriterijumima.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:hidden">
      {guests.map((guest) => {
        const isSelected = selectedIds.has(guest.id);
        const tableName = guest.table_id
          ? (tableNames.get(guest.table_id) ?? "Nepoznat sto")
          : null;

        return (
          <article
            key={guest.id}
            className={cn(
              "card-premium space-y-3 p-4 transition-colors",
              isSelected && "border-accent/40 bg-accent-soft/40",
            )}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[var(--accent)]"
                checked={isSelected}
                onChange={(event) => onToggleGuest(guest.id, event.target.checked)}
                aria-label={`Izaberi gosta ${guestFullName(guest)}`}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{guestFullName(guest)}</p>
                <p className="text-xs text-muted">
                  {SIDE_LABELS[guest.side]} · {GROUP_LABELS[guest.group_name]}
                </p>
              </div>

              <GuestActionsMenu
                guest={guest}
                tables={tables}
                disabled={isPending}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onAssignTable={onAssignTable}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={INVITATION_BADGE_CLASSES[guest.invitation_status]}>
                {INVITATION_LABELS[guest.invitation_status]}
              </Badge>

              <Badge className="bg-secondary text-secondary-foreground">
                <Armchair className="mr-1.5 size-3" aria-hidden />
                {tableName ?? "Bez stola"}
              </Badge>

              <Badge className="bg-secondary text-secondary-foreground">
                {guestHeadcount(guest)} mesta
              </Badge>

              {guest.plus_one ? (
                <Badge>
                  <UserPlus className="mr-1.5 size-3" aria-hidden />
                  {guest.plus_one_name ?? "Pratilac"}
                </Badge>
              ) : null}

              {guest.children_count > 0 ? (
                <Badge className="bg-secondary text-secondary-foreground">
                  <Baby className="mr-1.5 size-3" aria-hidden />
                  {guest.children_count}
                </Badge>
              ) : null}
            </div>

            {guest.phone ? (
              <a
                href={`tel:${guest.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-accent"
              >
                <Phone className="size-3.5" aria-hidden />
                {guest.phone}
              </a>
            ) : null}

            {guest.notes ? (
              <p className="text-xs text-muted">{guest.notes}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
