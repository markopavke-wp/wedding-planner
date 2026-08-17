"use client";

import { Plus } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/guests/bulk-actions-bar";
import { GuestCardList } from "@/components/guests/guest-card-list";
import { GuestFormDialog } from "@/components/guests/guest-form-dialog";
import {
  toGuestPayload,
  type GuestFormValues,
} from "@/components/guests/guest-form-schema";
import {
  GROUP_LABELS,
  INVITATION_LABELS,
  SIDE_LABELS,
} from "@/components/guests/guest-labels";
import { GuestsPagination } from "@/components/guests/guests-pagination";
import { GuestsSummary } from "@/components/guests/guests-summary";
import { GuestsTable } from "@/components/guests/guests-table";
import {
  DEFAULT_GUEST_FILTERS,
  GuestsToolbar,
  type GuestFilters,
  type GuestSortKey,
  type SortDirection,
} from "@/components/guests/guests-toolbar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ActionResult } from "@/lib/actions";
import {
  assignGuestToTable,
  bulkAssignGuestsToTable,
  createGuest,
  deleteGuest,
  updateGuest,
} from "@/lib/actions/guest";
import { cn, guestFullName, guestHeadcount } from "@/lib/utils";
import type {
  Guest,
  InvitationStatus,
  SeatingTable,
} from "@/types/database";

type GuestsClientProps = {
  weddingId: string;
  guests: Guest[];
  tables: SeatingTable[];
};

const STATUS_RANK: Record<InvitationStatus, number> = {
  confirmed: 0,
  pending: 1,
  declined: 2,
};

const collator = new Intl.Collator("sr", { sensitivity: "base" });

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(guests: Guest[], tableNames: Map<string, string>): string {
  const header = [
    "Prezime",
    "Ime",
    "Strana",
    "Grupa",
    "Status pozivnice",
    "Pratilac",
    "Ime pratioca",
    "Deca",
    "Mesta",
    "Sto",
    "Telefon",
    "Napomena",
  ];

  const rows = guests.map((guest) =>
    [
      guest.last_name,
      guest.first_name,
      SIDE_LABELS[guest.side],
      GROUP_LABELS[guest.group_name],
      INVITATION_LABELS[guest.invitation_status],
      guest.plus_one ? "Da" : "Ne",
      guest.plus_one_name ?? "",
      String(guest.children_count),
      String(guestHeadcount(guest)),
      guest.table_id ? (tableNames.get(guest.table_id) ?? "") : "",
      guest.phone ?? "",
      guest.notes ?? "",
    ].map(csvCell),
  );

  return [header.map(csvCell), ...rows].map((row) => row.join(";")).join("\r\n");
}

export function GuestsClient({ weddingId, guests, tables }: GuestsClientProps) {
  const [filters, setFilters] = useState<GuestFilters>(DEFAULT_GUEST_FILTERS);
  const [sortKey, setSortKey] = useState<GuestSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [rawSelectedIds, setRawSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<Guest[]>([]);
  const [isPending, startTransition] = useTransition();

  const tableNames = useMemo(
    () => new Map(tables.map((table) => [table.id, table.name])),
    [tables],
  );

  const guestsById = useMemo(
    () => new Map(guests.map((guest) => [guest.id, guest])),
    [guests],
  );

  const selectedIds = useMemo(
    () => rawSelectedIds.filter((id) => guestsById.has(id)),
    [guestsById, rawSelectedIds],
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredGuests = useMemo(() => {
    const term = normalize(filters.search.trim());

    return guests.filter((guest) => {
      if (term.length > 0) {
        const haystack = normalize(
          [
            guest.first_name,
            guest.last_name,
            guest.phone ?? "",
            guest.plus_one_name ?? "",
            guest.notes ?? "",
          ].join(" "),
        );
        if (!haystack.includes(term)) return false;
      }

      if (filters.side !== "all" && guest.side !== filters.side) return false;

      if (filters.status !== "all" && guest.invitation_status !== filters.status) {
        return false;
      }

      if (filters.group !== "all" && guest.group_name !== filters.group) {
        return false;
      }

      if (filters.table === "assigned" && guest.table_id === null) return false;
      if (filters.table === "unassigned" && guest.table_id !== null) return false;
      if (
        filters.table !== "all" &&
        filters.table !== "assigned" &&
        filters.table !== "unassigned" &&
        guest.table_id !== filters.table
      ) {
        return false;
      }

      return true;
    });
  }, [filters, guests]);

  const sortedGuests = useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    const byName = (a: Guest, b: Guest) =>
      collator.compare(a.last_name, b.last_name) ||
      collator.compare(a.first_name, b.first_name);

    return [...filteredGuests].sort((a, b) => {
      switch (sortKey) {
        case "status":
          return (
            factor *
              (STATUS_RANK[a.invitation_status] - STATUS_RANK[b.invitation_status]) ||
            byName(a, b)
          );
        case "group":
          return (
            factor *
              collator.compare(
                GROUP_LABELS[a.group_name],
                GROUP_LABELS[b.group_name],
              ) || byName(a, b)
          );
        case "side":
          return (
            factor * collator.compare(SIDE_LABELS[a.side], SIDE_LABELS[b.side]) ||
            byName(a, b)
          );
        case "headcount":
          return factor * (guestHeadcount(a) - guestHeadcount(b)) || byName(a, b);
        case "table": {
          const nameA = a.table_id ? (tableNames.get(a.table_id) ?? "") : "";
          const nameB = b.table_id ? (tableNames.get(b.table_id) ?? "") : "";
          if (nameA === "" && nameB !== "") return 1;
          if (nameB === "" && nameA !== "") return -1;
          return factor * collator.compare(nameA, nameB) || byName(a, b);
        }
        case "name":
        default:
          return factor * byName(a, b);
      }
    });
  }, [filteredGuests, sortDirection, sortKey, tableNames]);

  const filteredHeadcount = useMemo(
    () => filteredGuests.reduce((total, guest) => total + guestHeadcount(guest), 0),
    [filteredGuests],
  );

  const pageCount = Math.max(1, Math.ceil(sortedGuests.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageGuests = sortedGuests.slice(pageStart, pageStart + pageSize);

  const allVisibleSelected =
    pageGuests.length > 0 &&
    pageGuests.every((guest) => selectedIdSet.has(guest.id));

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.side !== "all" ||
    filters.status !== "all" ||
    filters.group !== "all" ||
    filters.table !== "all";

  const handleFilterChange = useCallback((patch: Partial<GuestFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_GUEST_FILTERS);
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (key: GuestSortKey, direction: SortDirection) => {
      setSortKey(key);
      setSortDirection(direction);
      setPage(1);
    },
    [],
  );

  const handleToggleGuest = useCallback((guestId: string, checked: boolean) => {
    setRawSelectedIds((current) =>
      checked
        ? current.includes(guestId)
          ? current
          : [...current, guestId]
        : current.filter((id) => id !== guestId),
    );
  }, []);

  const handleToggleVisible = useCallback(
    (checked: boolean) => {
      const visibleIds = pageGuests.map((guest) => guest.id);
      setRawSelectedIds((current) =>
        checked
          ? [...new Set([...current, ...visibleIds])]
          : current.filter((id) => !visibleIds.includes(id)),
      );
    },
    [pageGuests],
  );

  const runAction = useCallback(
    (
      action: () => Promise<ActionResult<unknown>>,
      successMessage: string,
      onSuccess?: () => void,
    ) => {
      startTransition(async () => {
        const result = await action();

        if (result.success) {
          toast.success(successMessage);
          onSuccess?.();
          return;
        }

        toast.error(result.error);
      });
    },
    [],
  );

  const runForMany = useCallback(
    (
      ids: string[],
      action: (guestId: string) => Promise<ActionResult<unknown>>,
      successMessage: (count: number) => string,
      onSuccess?: () => void,
    ) => {
      startTransition(async () => {
        let failed = 0;
        let firstError: string | null = null;

        for (const id of ids) {
          const result = await action(id);
          if (!result.success) {
            failed += 1;
            firstError = firstError ?? result.error;
          }
        }

        const succeeded = ids.length - failed;

        if (succeeded > 0) {
          toast.success(successMessage(succeeded));
          onSuccess?.();
        }

        if (failed > 0) {
          toast.error(
            `Neuspešno za ${failed} ${failed === 1 ? "gosta" : "gostiju"}: ${firstError ?? "nepoznata greška"}`,
          );
        }
      });
    },
    [],
  );

  const handleSubmitGuest = useCallback(
    (values: GuestFormValues) => {
      const payload = toGuestPayload(values, weddingId);
      const guest = editingGuest;

      runAction(
        () =>
          guest ? updateGuest({ ...payload, id: guest.id }) : createGuest(payload),
        guest ? "Podaci o gostu su sačuvani." : "Gost je dodat na listu.",
        () => {
          setFormOpen(false);
          setEditingGuest(null);
        },
      );
    },
    [editingGuest, runAction, weddingId],
  );

  const handleStatusChange = useCallback(
    (guest: Guest, status: InvitationStatus) => {
      runAction(
        () =>
          updateGuest({
            id: guest.id,
            wedding_id: weddingId,
            invitation_status: status,
          }),
        `Status pozivnice: ${INVITATION_LABELS[status]}.`,
      );
    },
    [runAction, weddingId],
  );

  const handleAssignTable = useCallback(
    (guest: Guest, tableId: string | null) => {
      runAction(
        () => assignGuestToTable(weddingId, guest.id, tableId),
        tableId
          ? `${guestFullName(guest)} je prebačen/a na sto „${tableNames.get(tableId) ?? ""}“.`
          : `${guestFullName(guest)} je uklonjen/a sa stola.`,
      );
    },
    [runAction, tableNames, weddingId],
  );

  const handleBulkAssignTable = useCallback(
    (tableId: string | null) => {
      runAction(
        () =>
          bulkAssignGuestsToTable({
            wedding_id: weddingId,
            guest_ids: selectedIds,
            table_id: tableId,
          }),
        tableId
          ? `Gosti su prebačeni na sto „${tableNames.get(tableId) ?? ""}“.`
          : "Gosti su uklonjeni sa stolova.",
      );
    },
    [runAction, selectedIds, tableNames, weddingId],
  );

  const handleBulkStatus = useCallback(
    (status: InvitationStatus) => {
      runForMany(
        selectedIds,
        (guestId) =>
          updateGuest({
            id: guestId,
            wedding_id: weddingId,
            invitation_status: status,
          }),
        (count) =>
          `Status „${INVITATION_LABELS[status]}“ postavljen za ${count} gostiju.`,
      );
    },
    [runForMany, selectedIds, weddingId],
  );

  const handleConfirmDelete = useCallback(() => {
    const ids = deleteTargets.map((guest) => guest.id);

    runForMany(
      ids,
      (guestId) => deleteGuest(weddingId, guestId),
      (count) => (count === 1 ? "Gost je obrisan." : `Obrisano gostiju: ${count}.`),
      () => {
        setDeleteTargets([]);
        setRawSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      },
    );
  }, [deleteTargets, runForMany, weddingId]);

  const handleExport = useCallback(() => {
    if (sortedGuests.length === 0) {
      toast.error("Nema gostiju za izvoz.");
      return;
    }

    const blob = new Blob([`\ufeff${buildCsv(sortedGuests, tableNames)}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `lista-gostiju-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Lista gostiju je izvezena.");
  }, [sortedGuests, tableNames]);

  const openCreateForm = useCallback(() => {
    setEditingGuest(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((guest: Guest) => {
    setEditingGuest(guest);
    setFormOpen(true);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Gosti
          </p>
          <h1 className="font-display text-4xl font-semibold">
            Upravljanje gostima
          </h1>
          <p className="text-sm text-muted">
            Evidencija pozivnica, pratilaca i rasporeda po stolovima.
          </p>
        </div>

        <Button size="lg" onClick={openCreateForm}>
          <Plus className="size-4" aria-hidden />
          Dodaj gosta
        </Button>
      </header>

      <GuestsSummary guests={guests} />

      <GuestsToolbar
        filters={filters}
        sortKey={sortKey}
        sortDirection={sortDirection}
        tables={tables}
        filteredCount={sortedGuests.length}
        filteredHeadcount={filteredHeadcount}
        totalCount={guests.length}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onSortChange={handleSortChange}
        onExport={handleExport}
      />

      <div
        className={cn(
          "space-y-4 transition-opacity",
          isPending && "pointer-events-none opacity-60",
        )}
        aria-busy={isPending}
      >
        <GuestsTable
          guests={pageGuests}
          tables={tables}
          tableNames={tableNames}
          selectedIds={selectedIdSet}
          allVisibleSelected={allVisibleSelected}
          sortKey={sortKey}
          sortDirection={sortDirection}
          isPending={isPending}
          onToggleGuest={handleToggleGuest}
          onToggleVisible={handleToggleVisible}
          onSortChange={handleSortChange}
          onEdit={openEditForm}
          onDelete={(guest) => setDeleteTargets([guest])}
          onStatusChange={handleStatusChange}
          onAssignTable={handleAssignTable}
        />

        <GuestCardList
          guests={pageGuests}
          tables={tables}
          tableNames={tableNames}
          selectedIds={selectedIdSet}
          isPending={isPending}
          onToggleGuest={handleToggleGuest}
          onEdit={openEditForm}
          onDelete={(guest) => setDeleteTargets([guest])}
          onStatusChange={handleStatusChange}
          onAssignTable={handleAssignTable}
        />

        <GuestsPagination
          page={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          totalCount={sortedGuests.length}
          rangeStart={sortedGuests.length === 0 ? 0 : pageStart + 1}
          rangeEnd={Math.min(pageStart + pageSize, sortedGuests.length)}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        filteredCount={sortedGuests.length}
        tables={tables}
        isPending={isPending}
        onSelectAllFiltered={() =>
          setRawSelectedIds(sortedGuests.map((guest) => guest.id))
        }
        onClearSelection={() => setRawSelectedIds([])}
        onAssignTable={handleBulkAssignTable}
        onStatusChange={handleBulkStatus}
        onDelete={() =>
          setDeleteTargets(
            selectedIds
              .map((id) => guestsById.get(id))
              .filter((guest): guest is Guest => guest !== undefined),
          )
        }
      />

      <GuestFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingGuest(null);
        }}
        guest={editingGuest}
        tables={tables}
        isPending={isPending}
        onSubmit={handleSubmitGuest}
      />

      <ConfirmDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) setDeleteTargets([]);
        }}
        title={
          deleteTargets.length > 1
            ? `Brisanje ${deleteTargets.length} gostiju`
            : "Brisanje gosta"
        }
        description={
          deleteTargets.length > 1
            ? "Izabrani gosti će biti trajno uklonjeni sa liste. Ova radnja se ne može poništiti."
            : `Gost ${deleteTargets[0] ? guestFullName(deleteTargets[0]) : ""} će biti trajno uklonjen sa liste. Ova radnja se ne može poništiti.`
        }
        loading={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
