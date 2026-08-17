"use client";

import {
  LayoutGrid,
  Pencil,
  Plus,
  RotateCw,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import {
  assignGuestToTable,
  applyTableSideAssignments,
  createTable,
  deleteTable,
  updateTable,
  updateTablePosition,
} from "@/lib/actions";
import { cn, guestFullName, guestHeadcount } from "@/lib/utils";
import type { Guest, SeatingTable, TableSide, Wedding } from "@/types/database";

import {
  buildSeatingAnalytics,
  compareTables,
  getUnassignedGuests,
  type TableOccupancy,
} from "./analytics";
import { formatMeters, nextTablePosition, type Point } from "./geometry";
import { GuestPanel } from "./guest-panel";
import { SeatingCanvas } from "./seating-canvas";
import {
  SeatingProvider,
  type SeatingActions,
  type SeatingContextValue,
} from "./seating-context";
import {
  buildSideSuggestionPreview,
  type SideSuggestionPreview,
} from "./suggestion";
import { TableDialog, type TableFormValues } from "./table-dialog";
import { normalizeRotation, ROTATION_STEP, TABLE_SIDE_LABELS, TABLE_SIDES, tableSideLabel } from "./types";

type PanelTab = "guests" | "analytics" | "suggestion";

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: "guests", label: "Gosti" },
  { id: "analytics", label: "Analitika" },
  { id: "suggestion", label: "Predlog strana" },
];

function isPanelTab(value: string): value is PanelTab {
  return value === "guests" || value === "analytics" || value === "suggestion";
}

/**
 * Klik na sto otvara njegov sadržaj: ko već sedi za njim i padajuću listu
 * neraspoređenih gostiju, pa dodavanje ne zavisi od prevlačenja.
 */
function SelectedTablePanel({
  table,
  occupancy,
  unassignedGuests,
  onAssignGuest,
  onChangeSide,
  onRotate,
  onEdit,
  onDelete,
}: {
  table: SeatingTable;
  occupancy: TableOccupancy | null;
  unassignedGuests: readonly Guest[];
  onAssignGuest: (guestId: string, tableId: string | null) => void;
  onChangeSide: (side: TableSide | null) => void;
  onRotate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const seatedGuests = occupancy?.guests ?? [];
  const occupied = occupancy?.occupied ?? 0;
  const freeSeats = Math.max(0, table.capacity - occupied);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{table.name}</p>
          <p className="text-xs tabular-nums text-muted">
            {occupied} / {table.capacity} mesta
            {freeSeats > 0 ? ` · ${freeSeats} slobodno` : " · popunjen"}
            {` · ${tableSideLabel(table.side)}`}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-11 sm:h-9"
          onClick={onRotate}
        >
          <RotateCw className="h-4 w-4" />
          Rotiraj
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-11 sm:h-9"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
          Izmeni
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-11 sm:h-9"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Obriši
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="seating-table-side">Strana stola</Label>
        <Select
          id="seating-table-side"
          value={table.side ?? "none"}
          onChange={(event) => {
            const value = event.target.value;
            onChangeSide(value === "none" ? null : (value as TableSide));
          }}
        >
          <option value="none">Bez strane</option>
          {TABLE_SIDES.map((side) => (
            <option key={side} value={side}>
              {TABLE_SIDE_LABELS[side]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="seating-add-guest">Dodaj gosta za ovaj sto</Label>
        {unassignedGuests.length === 0 ? (
          <p className="text-xs text-muted">
            Svi gosti su raspoređeni. Uklonite gosta sa drugog stola da biste ga
            premestili ovde.
          </p>
        ) : (
          <Select
            id="seating-add-guest"
            value=""
            onChange={(event) => {
              const guestId = event.target.value;
              if (guestId.length > 0) onAssignGuest(guestId, table.id);
            }}
          >
            <option value="">
              Izaberite gosta ({unassignedGuests.length} neraspoređenih)…
            </option>
            {unassignedGuests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guestFullName(guest)}
                {guestHeadcount(guest) > 1
                  ? ` — ${guestHeadcount(guest)} mesta`
                  : ""}
              </option>
            ))}
          </Select>
        )}
      </div>

      {seatedGuests.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted">Za stolom</p>
          <ul className="flex flex-wrap gap-2">
            {seatedGuests.map((guest) => (
              <li key={guest.id}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-2.5 pr-1 text-xs">
                  <span className="truncate">{guestFullName(guest)}</span>
                  {guestHeadcount(guest) > 1 ? (
                    <span className="tabular-nums text-muted">
                      ×{guestHeadcount(guest)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Ukloni ${guestFullName(guest)} sa stola`}
                    onClick={() => onAssignGuest(guest.id, null)}
                    className="flex size-7 items-center justify-center rounded-full text-muted transition hover:bg-secondary hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-none">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

export interface SeatingPlannerProps {
  wedding: Wedding;
  initialTables: SeatingTable[];
  initialGuests: Guest[];
}

export function SeatingPlanner({
  wedding,
  initialTables,
  initialGuests,
}: SeatingPlannerProps) {
  const [tables, setTables] = useState<SeatingTable[]>(() =>
    [...initialTables].sort(compareTables),
  );
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>("guests");

  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<SeatingTable | null>(null);
  const [tableToDelete, setTableToDelete] = useState<SeatingTable | null>(null);
  const [preview, setPreview] = useState<SideSuggestionPreview | null>(null);

  const [isPending, startTransition] = useTransition();

  const analytics = useMemo(
    () => buildSeatingAnalytics(tables, guests),
    [tables, guests],
  );
  const unassignedGuests = useMemo(
    () => getUnassignedGuests(guests),
    [guests],
  );
  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const assignGuest = useCallback(
    (guestId: string, tableId: string | null) => {
      const previous = guests.find((guest) => guest.id === guestId);
      if (previous === undefined || previous.table_id === tableId) return;

      setGuests((current) =>
        current.map((guest) =>
          guest.id === guestId
            ? { ...guest, table_id: tableId, seat_number: null }
            : guest,
        ),
      );

      startTransition(async () => {
        const result = await assignGuestToTable(wedding.id, guestId, tableId);

        if (!result.success) {
          setGuests((current) =>
            current.map((guest) => (guest.id === guestId ? previous : guest)),
          );
          toast.error(result.error);
          return;
        }

        const saved = result.data;
        setGuests((current) =>
          current.map((guest) => (guest.id === guestId ? saved : guest)),
        );
      });
    },
    [guests, wedding.id],
  );

  const handleTableMove = useCallback(
    (tableId: string, position: Point, isDragging: boolean) => {
      setTables((current) =>
        current.map((table) =>
          table.id === tableId
            ? { ...table, position_x: position.x, position_y: position.y }
            : table,
        ),
      );

      if (isDragging) return;

      startTransition(async () => {
        const result = await updateTablePosition({
          id: tableId,
          wedding_id: wedding.id,
          position_x: Math.round(position.x),
          position_y: Math.round(position.y),
        });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        const saved = result.data;
        setTables((current) =>
          current.map((table) => (table.id === tableId ? saved : table)),
        );
      });
    },
    [wedding.id],
  );

  const rotateTable = useCallback(
    (table: SeatingTable) => {
      const rotation = normalizeRotation(Number(table.rotation) + ROTATION_STEP);

      setTables((current) =>
        current.map((item) =>
          item.id === table.id ? { ...item, rotation } : item,
        ),
      );

      startTransition(async () => {
        const result = await updateTable({
          id: table.id,
          wedding_id: wedding.id,
          rotation,
        });

        if (!result.success) {
          setTables((current) =>
            current.map((item) => (item.id === table.id ? table : item)),
          );
          toast.error(result.error);
        }
      });
    },
    [wedding.id],
  );

  const changeTableSide = useCallback(
    (table: SeatingTable, side: TableSide | null) => {
      if (table.side === side) return;

      setTables((current) =>
        current.map((item) =>
          item.id === table.id ? { ...item, side } : item,
        ),
      );

      startTransition(async () => {
        const result = await updateTable({
          id: table.id,
          wedding_id: wedding.id,
          side,
        });

        if (!result.success) {
          setTables((current) =>
            current.map((item) => (item.id === table.id ? table : item)),
          );
          toast.error(result.error);
          return;
        }

        const saved = result.data;
        setTables((current) =>
          current.map((item) => (item.id === saved.id ? saved : item)),
        );
      });
    },
    [wedding.id],
  );

  const openEditDialog = useCallback((table: SeatingTable) => {
    setEditingTable(table);
    setTableDialogOpen(true);
  }, []);

  const actions = useMemo<SeatingActions>(
    () => ({
      assignGuest,
      editTable: openEditDialog,
      deleteTable: setTableToDelete,
      rotateTable,
    }),
    [assignGuest, openEditDialog, rotateTable],
  );

  const seatingContext = useMemo<SeatingContextValue>(
    () => ({ actions, draggedGuestId, setDraggedGuestId, isPending }),
    [actions, draggedGuestId, isPending],
  );

  function handleTableSubmit(values: TableFormValues) {
    const target = editingTable;

    startTransition(async () => {
      if (target !== null) {
        const result = await updateTable({
          id: target.id,
          wedding_id: wedding.id,
          ...values,
        });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        const saved = result.data;
        setTables((current) =>
          current
            .map((table) => (table.id === saved.id ? saved : table))
            .sort(compareTables),
        );
        toast.success("Sto je izmenjen");
      } else {
        const position = nextTablePosition(tables, values.shape);
        const result = await createTable({
          wedding_id: wedding.id,
          ...values,
          position_x: position.x,
          position_y: position.y,
          rotation: 0,
        });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        const saved = result.data;
        setTables((current) => [...current, saved].sort(compareTables));
        toast.success("Sto je dodat");
      }

      setTableDialogOpen(false);
      setEditingTable(null);
    });
  }

  function handleDeleteTable() {
    const target = tableToDelete;
    if (target === null) return;

    startTransition(async () => {
      const result = await deleteTable(wedding.id, target.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setTables((current) =>
        current.filter((table) => table.id !== target.id),
      );
      setGuests((current) =>
        current.map((guest) =>
          guest.table_id === target.id
            ? { ...guest, table_id: null, seat_number: null }
            : guest,
        ),
      );
      setSelectedTableId((current) =>
        current === target.id ? null : current,
      );
      setTableToDelete(null);
      toast.success("Sto je obrisan");
    });
  }

  function handleApplySuggestion() {
    const current = preview;
    if (current === null || current.assignments.length === 0) return;

    startTransition(async () => {
      const result = await applyTableSideAssignments({
        wedding_id: wedding.id,
        assignments: current.assignments,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const sideById = new Map(
        current.assignments.map((assignment) => [
          assignment.id,
          assignment.side,
        ]),
      );
      setTables((tablesState) =>
        tablesState.map((table) => {
          const side = sideById.get(table.id);
          return side === undefined ? table : { ...table, side };
        }),
      );
      setPreview(null);
      toast.success(`Ažurirano stolova: ${result.data.updated}`);
    });
  }

  return (
    <SeatingProvider value={seatingContext}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Plan sale</h1>
            <p className="text-sm text-muted">
              {wedding.title}
              {wedding.venue !== null ? ` — ${wedding.venue}` : ""}
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingTable(null);
              setTableDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novi sto
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="gap-4">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-accent" />
                <CardTitle>Raspored stolova</CardTitle>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{analytics.tableCount} stolova</Badge>
                <Badge>{analytics.seatedCount} raspoređenih mesta</Badge>
                <Badge>{analytics.unassignedCount} neraspoređenih</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SeatingCanvas
                tables={tables}
                analytics={analytics}
                selectedTableId={selectedTableId}
                onSelectTable={setSelectedTableId}
                onTableMove={handleTableMove}
              />

              {/* Dugmad na samom stolu se smanjuju sa zumom, pa akcije za
                  izabrani sto stoje i ovde, u punoj veličini. */}
              {selectedTable === null ? (
                <p className="text-xs text-muted">
                  Dodirnite sto na planu da biste ga rotirali, izmenili ili
                  obrisali.
                </p>
              ) : (
                <SelectedTablePanel
                  table={selectedTable}
                  occupancy={analytics.byTableId.get(selectedTable.id) ?? null}
                  unassignedGuests={unassignedGuests}
                  onAssignGuest={assignGuest}
                  onChangeSide={(side) => changeTableSide(selectedTable, side)}
                  onRotate={() => rotateTable(selectedTable)}
                  onEdit={() => openEditDialog(selectedTable)}
                  onDelete={() => setTableToDelete(selectedTable)}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Tabs
              tabs={PANEL_TABS}
              active={tab}
              onChange={(id) => {
                if (isPanelTab(id)) setTab(id);
              }}
            />

            {tab === "guests" ? (
              <Card className="gap-4">
                <CardHeader className="flex-row items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <CardTitle>Gosti</CardTitle>
                </CardHeader>
                <CardContent>
                  <GuestPanel
                    analytics={analytics}
                    unassignedGuests={unassignedGuests}
                  />
                </CardContent>
              </Card>
            ) : null}

            {tab === "analytics" ? (
              <Card className="gap-4">
                <CardHeader>
                  <CardTitle>Analitika rasporeda</CardTitle>
                  <CardDescription>
                    Udaljenosti se mere od centra glavnog stola.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <StatRow
                      label="Ukupno mesta"
                      value={String(analytics.totalCapacity)}
                    />
                    <StatRow
                      label="Zauzeto mesta"
                      value={String(analytics.seatedCount)}
                    />
                    <StatRow
                      label="Slobodno mesta"
                      value={String(analytics.freeSeats)}
                    />
                    <StatRow
                      label="Neraspoređeni gosti"
                      value={String(analytics.unassignedCount)}
                    />
                    <StatRow
                      label="Odbili poziv"
                      value={String(analytics.declinedCount)}
                    />
                    <StatRow
                      label="Prosečna udaljenost — mladina strana"
                      value={
                        analytics.brideAverageDistanceM === null
                          ? "—"
                          : formatMeters(analytics.brideAverageDistanceM)
                      }
                    />
                    <StatRow
                      label="Prosečna udaljenost — mladoženjina strana"
                      value={
                        analytics.groomAverageDistanceM === null
                          ? "—"
                          : formatMeters(analytics.groomAverageDistanceM)
                      }
                    />
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border border-border p-4",
                      analytics.balanceLevel === "balanced" && "bg-accent-soft",
                    )}
                  >
                    <p className="text-sm font-semibold">
                      {analytics.balanceLabel}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {analytics.balanceText}
                    </p>
                  </div>

                  {analytics.overCapacityTables.length > 0 ? (
                    <div className="rounded-2xl border border-destructive/40 p-4">
                      <p className="text-sm font-semibold text-destructive">
                        Prepunjeni stolovi
                      </p>
                      <ul className="mt-1 flex flex-col gap-1 text-sm text-muted">
                        {analytics.overCapacityTables.map((occupancy) => (
                          <li key={occupancy.table.id}>
                            {occupancy.table.name}: {occupancy.occupied} /{" "}
                            {occupancy.table.capacity} (višak{" "}
                            {occupancy.overflow})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {tab === "suggestion" ? (
              <Card className="gap-4">
                <CardHeader>
                  <CardTitle>Predlog strana stolova</CardTitle>
                  <CardDescription>
                    Predlog se pravi na osnovu udaljenosti od glavnog stola i
                    broja gostiju po strani. Ništa se ne menja dok ne
                    potvrdite.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    disabled={tables.length === 0}
                    onClick={() =>
                      setPreview(buildSideSuggestionPreview(tables, guests))
                    }
                  >
                    <Sparkles className="h-4 w-4" />
                    Napravi predlog
                  </Button>

                  {tables.length === 0 ? (
                    <p className="text-sm text-muted">
                      Dodajte stolove da biste dobili predlog.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <TableDialog
        open={tableDialogOpen}
        onOpenChange={(open) => {
          setTableDialogOpen(open);
          if (!open) setEditingTable(null);
        }}
        table={editingTable}
        isSaving={isPending}
        onSubmit={handleTableSubmit}
      />

      <ConfirmDialog
        open={tableToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTableToDelete(null);
        }}
        title="Brisanje stola"
        description={
          tableToDelete === null
            ? ""
            : `Da li ste sigurni da želite da obrišete sto „${tableToDelete.name}"? Gosti sa tog stola postaju neraspoređeni.`
        }
        onConfirm={handleDeleteTable}
        loading={isPending}
      />

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        title="Predlog strana stolova"
        className="max-w-2xl"
      >
        {preview === null ? null : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">{preview.summary}</p>

            <div className="scrollbar-slim max-h-80 overflow-y-auto rounded-2xl border border-border">
              <table className="table-sticky-head w-full text-sm [--table-head-bg:var(--secondary)]">
                <thead className="text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Sto</th>
                    <th className="px-3 py-2 font-medium">Sada</th>
                    <th className="px-3 py-2 font-medium">Predlog</th>
                    <th className="px-3 py-2 font-medium">Udaljenost</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr
                      key={row.table.id}
                      className={cn(
                        "border-t border-border",
                        row.isChange && "bg-accent-soft",
                      )}
                    >
                      <td className="px-3 py-2">{row.table.name}</td>
                      <td className="px-3 py-2 text-muted">
                        {tableSideLabel(row.currentSide)}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {tableSideLabel(row.suggestedSide)}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-muted">
                        {row.distanceToHeadM === null
                          ? "—"
                          : formatMeters(row.distanceToHeadM)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPreview(null)}>
                Otkaži
              </Button>
              <Button
                onClick={handleApplySuggestion}
                disabled={isPending || preview.changeCount === 0}
              >
                {isPending ? "Primena..." : "Primeni"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </SeatingProvider>
  );
}
