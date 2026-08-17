import { guestHeadcount } from "@/lib/utils";
import type { Guest, SeatingTable, TableSide } from "@/types/database";

import {
  compareTables,
  findHeadTable,
  isAttending,
  isGuestOnWeddingSide,
} from "./analytics";
import { getTableCenter, pixelsToMeters, euclideanDistance } from "./geometry";
import { TABLE_SIDE_LABELS } from "./types";

export interface SideSuggestionRow {
  table: SeatingTable;
  currentSide: TableSide | null;
  suggestedSide: TableSide;
  isChange: boolean;
  distanceToHeadM: number | null;
}

export interface SideSuggestionAssignment {
  id: string;
  side: TableSide;
}

export interface SideSuggestionPreview {
  rows: SideSuggestionRow[];
  assignments: SideSuggestionAssignment[];
  changeCount: number;
  hasHeadTable: boolean;
  brideDemand: number;
  groomDemand: number;
  brideCapacity: number;
  groomCapacity: number;
  summary: string;
}

function demandForSide(guests: readonly Guest[], side: TableSide): number {
  if (side === "mixed") return 0;

  return guests
    .filter(
      (guest) =>
        isAttending(guest) && isGuestOnWeddingSide(guest.side, side),
    )
    .reduce((sum, guest) => sum + guestHeadcount(guest), 0);
}

/**
 * Predlog je determinističan: stolovi se obrađuju od najbližeg ka najdaljem od
 * glavnog stola i uvek pripadaju strani kojoj je ostalo više neraspoređenih
 * mesta, pa isti ulaz uvek daje isti rezultat.
 */
export function buildSideSuggestionPreview(
  tables: readonly SeatingTable[],
  guests: readonly Guest[],
): SideSuggestionPreview {
  const headTable = findHeadTable(tables);
  const headCenter = headTable === null ? null : getTableCenter(headTable);

  const distanceToHeadPx = (table: SeatingTable): number | null =>
    headCenter === null
      ? null
      : euclideanDistance(headCenter, getTableCenter(table));

  const ordered = tables
    .filter((table) => table.shape !== "head_table")
    .map((table) => ({ table, distancePx: distanceToHeadPx(table) }))
    .sort((a, b) => {
      if (a.distancePx !== null && b.distancePx !== null) {
        const byDistance = a.distancePx - b.distancePx;
        if (Math.abs(byDistance) > 0.001) return byDistance;
      }
      return compareTables(a.table, b.table);
    });

  const brideDemand = demandForSide(guests, "bride");
  const groomDemand = demandForSide(guests, "groom");

  let brideRemaining = brideDemand;
  let groomRemaining = groomDemand;
  let brideCapacity = 0;
  let groomCapacity = 0;

  const rows: SideSuggestionRow[] = [];

  if (headTable !== null) {
    rows.push({
      table: headTable,
      currentSide: headTable.side,
      suggestedSide: "mixed",
      isChange: headTable.side !== "mixed",
      distanceToHeadM: 0,
    });
  }

  ordered.forEach(({ table, distancePx }, index) => {
    let suggestedSide: TableSide;

    if (brideRemaining > groomRemaining) {
      suggestedSide = "bride";
    } else if (groomRemaining > brideRemaining) {
      suggestedSide = "groom";
    } else if (headCenter !== null) {
      const center = getTableCenter(table);
      suggestedSide =
        center.x < headCenter.x
          ? "bride"
          : center.x > headCenter.x
            ? "groom"
            : index % 2 === 0
              ? "bride"
              : "groom";
    } else {
      suggestedSide = index % 2 === 0 ? "bride" : "groom";
    }

    if (suggestedSide === "bride") {
      brideRemaining = Math.max(0, brideRemaining - table.capacity);
      brideCapacity += table.capacity;
    } else {
      groomRemaining = Math.max(0, groomRemaining - table.capacity);
      groomCapacity += table.capacity;
    }

    rows.push({
      table,
      currentSide: table.side,
      suggestedSide,
      isChange: table.side !== suggestedSide,
      distanceToHeadM: distancePx === null ? null : pixelsToMeters(distancePx),
    });
  });

  const changeCount = rows.filter((row) => row.isChange).length;

  return {
    rows,
    assignments: rows.map((row) => ({
      id: row.table.id,
      side: row.suggestedSide,
    })),
    changeCount,
    hasHeadTable: headTable !== null,
    brideDemand,
    groomDemand,
    brideCapacity,
    groomCapacity,
    summary: buildSummary(rows.length, changeCount, headTable !== null),
  };
}

function buildSummary(
  tableCount: number,
  changeCount: number,
  hasHeadTable: boolean,
): string {
  if (tableCount === 0) {
    return "Nema stolova za koje bismo predložili strane. Dodajte stolove u plan sale.";
  }

  const headNote = hasHeadTable
    ? `Glavni sto ostaje označen kao „${TABLE_SIDE_LABELS.mixed}".`
    : "Nema glavnog stola, pa su strane raspoređene po redosledu naziva stolova.";

  if (changeCount === 0) {
    return `Trenutne strane stolova već odgovaraju predlogu. ${headNote}`;
  }

  return `Predlog menja stranu za ${changeCount} od ${tableCount} stolova. ${headNote}`;
}
