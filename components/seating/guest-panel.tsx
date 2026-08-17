"use client";

import { Search, UserMinus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn, guestFullName, guestHeadcount } from "@/lib/utils";
import type { Guest, GuestSide } from "@/types/database";

import type { SeatingAnalytics } from "./analytics";
import {
  allowGuestDrop,
  readDraggedGuestId,
  startGuestDrag,
  useSeating,
} from "./seating-context";
import { GUEST_SIDE_LABELS, tableSideLabel } from "./types";

type SideFilter = GuestSide | "all";

function matchesSearch(guest: Guest, query: string): boolean {
  if (query.length === 0) return true;
  const haystack = `${guestFullName(guest)} ${guest.plus_one_name ?? ""}`;
  return haystack.toLocaleLowerCase("sr").includes(query);
}

function GuestChip({
  guest,
  onRemove,
}: {
  guest: Guest;
  onRemove?: () => void;
}) {
  const { setDraggedGuestId } = useSeating();
  const headcount = guestHeadcount(guest);

  return (
    <span
      draggable
      onDragStart={(event) => {
        startGuestDrag(event, guest.id);
        setDraggedGuestId(guest.id);
      }}
      onDragEnd={() => setDraggedGuestId(null)}
      className="inline-flex cursor-grab items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-2.5 pr-1 text-xs shadow-soft"
    >
      <span className="truncate">{guestFullName(guest)}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted">
        {GUEST_SIDE_LABELS[guest.side]}
      </span>
      {headcount > 1 ? (
        <span className="tabular-nums text-muted">×{headcount}</span>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          aria-label={`Ukloni ${guestFullName(guest)} sa stola`}
          onClick={onRemove}
          className="flex size-7 items-center justify-center rounded-full text-muted transition hover:bg-secondary hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </span>
  );
}

/**
 * Prevlačenje se oslanja na HTML5 drag-and-drop, koji na mobilnim browserima ne
 * radi, pa je dodela stola preko liste jedini put na telefonu i tabletu.
 */
function AssignTableSelect({
  guest,
  occupancies,
  onAssign,
}: {
  guest: Guest;
  occupancies: SeatingAnalytics["occupancies"];
  onAssign: (tableId: string) => void;
}) {
  return (
    <Select
      value=""
      aria-label={`Dodeli gosta ${guestFullName(guest)} na sto`}
      onChange={(event) => {
        const tableId = event.target.value;
        if (tableId.length > 0) onAssign(tableId);
      }}
      className="w-full py-2 text-xs sm:w-44"
    >
      <option value="">Dodeli na sto…</option>
      {occupancies.map((occupancy) => (
        <option key={occupancy.table.id} value={occupancy.table.id}>
          {occupancy.table.name}
          {occupancy.freeSeats > 0
            ? ` — ${occupancy.freeSeats} slobodno`
            : " — popunjen"}
        </option>
      ))}
    </Select>
  );
}

export interface GuestPanelProps {
  analytics: SeatingAnalytics;
  unassignedGuests: readonly Guest[];
}

export function GuestPanel({ analytics, unassignedGuests }: GuestPanelProps) {
  const { actions, draggedGuestId, setDraggedGuestId } = useSeating();
  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState<SideFilter>("all");
  const [isOverDropZone, setIsOverDropZone] = useState(false);

  const query = search.trim().toLocaleLowerCase("sr");

  const matches = useMemo(
    () =>
      (guest: Guest): boolean =>
        (sideFilter === "all" || guest.side === sideFilter) &&
        matchesSearch(guest, query),
    [sideFilter, query],
  );

  const filteredUnassigned = useMemo(
    () => unassignedGuests.filter(matches),
    [unassignedGuests, matches],
  );

  const seatedGroups = useMemo(
    () =>
      analytics.occupancies
        .map((occupancy) => ({
          occupancy,
          guests: occupancy.guests.filter(matches),
        }))
        .filter((group) => group.guests.length > 0),
    [analytics, matches],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pretraga gostiju"
            aria-label="Pretraga gostiju"
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seating-side-filter">Strana</Label>
          <Select
            id="seating-side-filter"
            value={sideFilter}
            onChange={(event) =>
              setSideFilter(event.target.value as SideFilter)
            }
          >
            <option value="all">Sve strane</option>
            <option value="bride">{GUEST_SIDE_LABELS.bride}</option>
            <option value="groom">{GUEST_SIDE_LABELS.groom}</option>
            <option value="bride_parents">
              {GUEST_SIDE_LABELS.bride_parents}
            </option>
            <option value="groom_parents">
              {GUEST_SIDE_LABELS.groom_parents}
            </option>
          </Select>
        </div>
      </div>

      <div
        onDragOver={(event) => {
          if (draggedGuestId === null) return;
          allowGuestDrop(event);
          setIsOverDropZone(true);
        }}
        onDragLeave={() => setIsOverDropZone(false)}
        onDrop={(event) => {
          const guestId = readDraggedGuestId(event);
          setIsOverDropZone(false);
          setDraggedGuestId(null);
          if (guestId === null) return;
          event.preventDefault();
          actions.assignGuest(guestId, null);
        }}
        className={cn(
          // Zona za prevlačenje nema smisla na dodiru; tamo se uklanja dugmetom.
          "hidden items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-5 text-center text-xs text-muted transition md:flex",
          draggedGuestId !== null && "border-accent text-accent",
          isOverDropZone && "bg-accent-soft",
        )}
      >
        <UserMinus className="h-4 w-4" />
        Prevucite gosta ovde da ga uklonite sa stola
      </div>

      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Neraspoređeni gosti</h3>
          <Badge>{filteredUnassigned.length}</Badge>
        </header>

        {filteredUnassigned.length === 0 ? (
          <p className="text-xs text-muted">
            Nema gostiju koji odgovaraju filteru.
          </p>
        ) : analytics.occupancies.length === 0 ? (
          <p className="text-xs text-muted">
            Dodajte sto da biste mogli da rasporedite goste.
          </p>
        ) : (
          <ul className="scrollbar-slim flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {filteredUnassigned.map((guest) => {
              const headcount = guestHeadcount(guest);

              return (
                <li
                  key={guest.id}
                  className="flex flex-col gap-2 rounded-2xl border border-border p-2 sm:flex-row sm:items-center"
                >
                  <span
                    draggable
                    onDragStart={(event) => {
                      startGuestDrag(event, guest.id);
                      setDraggedGuestId(guest.id);
                    }}
                    onDragEnd={() => setDraggedGuestId(null)}
                    className="min-w-0 flex-1 cursor-grab px-1"
                  >
                    <span className="block truncate text-sm">
                      {guestFullName(guest)}
                    </span>
                    <span className="text-[11px] text-muted">
                      {GUEST_SIDE_LABELS[guest.side]}
                      {headcount > 1 ? ` · ${headcount} osobe` : ""}
                    </span>
                  </span>

                  <AssignTableSelect
                    guest={guest}
                    occupancies={analytics.occupancies}
                    onAssign={(tableId) => actions.assignGuest(guest.id, tableId)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Gosti po stolovima</h3>

        {seatedGroups.length === 0 ? (
          <p className="text-xs text-muted">
            Nijedan gost još nije raspoređen za sto.
          </p>
        ) : (
          <div className="scrollbar-slim flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
            {seatedGroups.map(({ occupancy, guests }) => (
              <div
                key={occupancy.table.id}
                className="rounded-2xl border border-border p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {occupancy.table.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      {tableSideLabel(occupancy.table.side)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs tabular-nums",
                      occupancy.isOverCapacity
                        ? "font-semibold text-destructive"
                        : "text-muted",
                    )}
                  >
                    {occupancy.occupied} / {occupancy.table.capacity}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {guests.map((guest) => (
                    <GuestChip
                      key={guest.id}
                      guest={guest}
                      onRemove={() => actions.assignGuest(guest.id, null)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
