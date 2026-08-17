import { guestFullName, guestHeadcount } from "@/lib/utils";
import type { Guest, GuestSide, SeatingTable } from "@/types/database";

import {
  distanceBetweenTables,
  formatMeters,
  pixelsToMeters,
} from "./geometry";

export type BalanceLevel = "unknown" | "balanced" | "slight" | "unbalanced";

export interface TableOccupancy {
  table: SeatingTable;
  guests: Guest[];
  declinedGuests: Guest[];
  occupied: number;
  freeSeats: number;
  overflow: number;
  isOverCapacity: boolean;
  isFull: boolean;
  occupancyPercent: number;
  brideSeats: number;
  groomSeats: number;
  distanceToHeadPx: number | null;
  distanceToHeadM: number | null;
}

export interface SeatingAnalytics {
  occupancies: TableOccupancy[];
  byTableId: Map<string, TableOccupancy>;
  headTable: SeatingTable | null;
  tableCount: number;
  totalCapacity: number;
  seatedCount: number;
  unassignedCount: number;
  declinedCount: number;
  freeSeats: number;
  overCapacityTables: TableOccupancy[];
  brideSeated: number;
  groomSeated: number;
  brideAverageDistanceM: number | null;
  groomAverageDistanceM: number | null;
  distanceDifferenceM: number | null;
  closerSide: GuestSide | null;
  balanceLevel: BalanceLevel;
  balanceLabel: string;
  balanceText: string;
}

/** Razlika prosečnih udaljenosti do koje raspored smatramo uravnoteženim. */
const BALANCED_THRESHOLD_M = 1;
const SLIGHT_THRESHOLD_M = 3;

export function isAttending(guest: Guest): boolean {
  return guest.invitation_status !== "declined";
}

export function compareGuests(a: Guest, b: Guest): number {
  const byName = guestFullName(a).localeCompare(guestFullName(b), "sr", {
    numeric: true,
  });
  return byName !== 0 ? byName : a.id.localeCompare(b.id);
}

export function compareTables(a: SeatingTable, b: SeatingTable): number {
  const byName = a.name.localeCompare(b.name, "sr", { numeric: true });
  return byName !== 0 ? byName : a.id.localeCompare(b.id);
}

export function findHeadTable(
  tables: readonly SeatingTable[],
): SeatingTable | null {
  return (
    [...tables]
      .filter((table) => table.shape === "head_table")
      .sort(compareTables)[0] ?? null
  );
}

export function getUnassignedGuests(guests: readonly Guest[]): Guest[] {
  return guests
    .filter((guest) => guest.table_id === null)
    .sort(compareGuests);
}

function groupGuestsByTable(guests: readonly Guest[]): Map<string, Guest[]> {
  const grouped = new Map<string, Guest[]>();

  for (const guest of [...guests].sort(compareGuests)) {
    if (guest.table_id === null) continue;
    const list = grouped.get(guest.table_id) ?? [];
    list.push(guest);
    grouped.set(guest.table_id, list);
  }

  return grouped;
}

export function isGuestOnWeddingSide(
  guestSide: GuestSide,
  side: "bride" | "groom",
): boolean {
  return side === "bride"
    ? guestSide === "bride" || guestSide === "bride_parents"
    : guestSide === "groom" || guestSide === "groom_parents";
}

function seatsForSide(
  guests: readonly Guest[],
  side: "bride" | "groom",
): number {
  return guests
    .filter((guest) => isGuestOnWeddingSide(guest.side, side))
    .reduce((sum, guest) => sum + guestHeadcount(guest), 0);
}

interface BalanceDescription {
  balanceLevel: BalanceLevel;
  balanceLabel: string;
  balanceText: string;
}

function describeBalance(
  hasHeadTable: boolean,
  distanceDifferenceM: number | null,
  closerSide: GuestSide | null,
): BalanceDescription {
  if (!hasHeadTable) {
    return {
      balanceLevel: "unknown",
      balanceLabel: "Nema glavnog stola",
      balanceText:
        "Dodajte glavni sto da bismo izračunali udaljenosti i ravnotežu strana.",
    };
  }

  if (distanceDifferenceM === null || closerSide === null) {
    return {
      balanceLevel: "unknown",
      balanceLabel: "Nedovoljno podataka",
      balanceText:
        "Rasporedite goste sa obe strane da bismo uporedili prosečne udaljenosti od glavnog stola.",
    };
  }

  const closer =
    closerSide === "bride" ? "Mladina strana" : "Mladoženjina strana";
  const difference = formatMeters(distanceDifferenceM);

  if (distanceDifferenceM <= BALANCED_THRESHOLD_M) {
    return {
      balanceLevel: "balanced",
      balanceLabel: "Uravnoteženo",
      balanceText: `Obe strane su u proseku podjednako blizu glavnog stola (razlika ${difference}).`,
    };
  }

  if (distanceDifferenceM <= SLIGHT_THRESHOLD_M) {
    return {
      balanceLevel: "slight",
      balanceLabel: "Blaga neravnoteža",
      balanceText: `${closer} je u proseku ${difference} bliže glavnom stolu.`,
    };
  }

  return {
    balanceLevel: "unbalanced",
    balanceLabel: "Izražena neravnoteža",
    balanceText: `${closer} je u proseku ${difference} bliže glavnom stolu. Razmislite o premeštanju stolova ili gostiju.`,
  };
}

/**
 * Prosečne udaljenosti su ponderisane brojem mesta koje gosti zauzimaju, pa sto
 * sa deset gostiju utiče na ravnotežu deset puta više od stola sa jednim.
 */
export function buildSeatingAnalytics(
  tables: readonly SeatingTable[],
  guests: readonly Guest[],
): SeatingAnalytics {
  const headTable = findHeadTable(tables);
  const grouped = groupGuestsByTable(guests);

  let brideWeightedPx = 0;
  let brideSeatsWithDistance = 0;
  let groomWeightedPx = 0;
  let groomSeatsWithDistance = 0;

  const occupancies = [...tables]
    .sort(compareTables)
    .map<TableOccupancy>((table) => {
      const allGuests = grouped.get(table.id) ?? [];
      const attending = allGuests.filter(isAttending);
      const occupied = attending.reduce(
        (sum, guest) => sum + guestHeadcount(guest),
        0,
      );
      const brideSeats = seatsForSide(attending, "bride");
      const groomSeats = seatsForSide(attending, "groom");
      const distanceToHeadPx =
        headTable === null ? null : distanceBetweenTables(headTable, table);

      if (distanceToHeadPx !== null) {
        brideWeightedPx += brideSeats * distanceToHeadPx;
        brideSeatsWithDistance += brideSeats;
        groomWeightedPx += groomSeats * distanceToHeadPx;
        groomSeatsWithDistance += groomSeats;
      }

      return {
        table,
        guests: attending,
        declinedGuests: allGuests.filter((guest) => !isAttending(guest)),
        occupied,
        freeSeats: Math.max(0, table.capacity - occupied),
        overflow: Math.max(0, occupied - table.capacity),
        isOverCapacity: occupied > table.capacity,
        isFull: occupied === table.capacity,
        occupancyPercent:
          table.capacity > 0
            ? Math.round((occupied / table.capacity) * 100)
            : 0,
        brideSeats,
        groomSeats,
        distanceToHeadPx,
        distanceToHeadM:
          distanceToHeadPx === null ? null : pixelsToMeters(distanceToHeadPx),
      };
    });

  const attendingGuests = guests.filter(isAttending);
  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
  const seatedCount = occupancies.reduce(
    (sum, occupancy) => sum + occupancy.occupied,
    0,
  );
  const unassignedCount = attendingGuests
    .filter((guest) => guest.table_id === null)
    .reduce((sum, guest) => sum + guestHeadcount(guest), 0);

  const brideAverageDistanceM =
    brideSeatsWithDistance > 0
      ? pixelsToMeters(brideWeightedPx / brideSeatsWithDistance)
      : null;
  const groomAverageDistanceM =
    groomSeatsWithDistance > 0
      ? pixelsToMeters(groomWeightedPx / groomSeatsWithDistance)
      : null;

  const hasBothSides =
    brideAverageDistanceM !== null && groomAverageDistanceM !== null;
  const distanceDifferenceM = hasBothSides
    ? Math.abs(brideAverageDistanceM - groomAverageDistanceM)
    : null;
  const closerSide: GuestSide | null = hasBothSides
    ? brideAverageDistanceM <= groomAverageDistanceM
      ? "bride"
      : "groom"
    : null;

  return {
    occupancies,
    byTableId: new Map(
      occupancies.map((occupancy) => [occupancy.table.id, occupancy]),
    ),
    headTable,
    tableCount: tables.length,
    totalCapacity,
    seatedCount,
    unassignedCount,
    declinedCount: guests.length - attendingGuests.length,
    freeSeats: Math.max(0, totalCapacity - seatedCount),
    overCapacityTables: occupancies.filter(
      (occupancy) => occupancy.isOverCapacity,
    ),
    brideSeated: brideSeatsWithDistance,
    groomSeated: groomSeatsWithDistance,
    brideAverageDistanceM,
    groomAverageDistanceM,
    distanceDifferenceM,
    closerSide,
    ...describeBalance(headTable !== null, distanceDifferenceM, closerSide),
  };
}
