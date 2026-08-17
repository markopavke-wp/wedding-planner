import { guestHeadcount } from "@/lib/utils";
import type {
  BudgetItem,
  Guest,
  InvitationStatus,
  SeatingTable,
  Task,
  TaskStatus,
  Wedding,
} from "@/types/database";

import { getBudgetItems } from "./budget";
import { getGuests } from "./guest";
import { getNotes } from "./note";
import { getTables } from "./table";
import { getTasks } from "./task";
import { getTimelineItems } from "./timeline";
import { getVendors } from "./vendor";
import { getWedding } from "./wedding";

export type DashboardStats = {
  wedding: Wedding;
  guests: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    bride: number;
    groom: number;
    brideParents: number;
    groomParents: number;
  };
  budget: {
    planned: number;
    agreed: number;
    paid: number;
    remaining: number;
  };
  tasks: {
    total: number;
    completed: number;
    remaining: number;
    overdue: number;
  };
  seating: {
    tables: number;
    capacity: number;
    assigned: number;
    unassigned: number;
  };
  vendors: {
    total: number;
  };
  timeline: {
    total: number;
    completed: number;
    upcoming: number;
  };
  notes: {
    total: number;
  };
  budgetByCategory: { category: string; value: number }[];
  guestStatusChart: { name: string; value: number }[];
  sideChart: { name: string; value: number }[];
  taskProgress: { name: string; value: number }[];
};

function sumGuestHeads(
  guests: Guest[],
  predicate?: (guest: Guest) => boolean,
): number {
  return guests
    .filter((guest) => (predicate ? predicate(guest) : true))
    .reduce((sum, guest) => sum + guestHeadcount(guest), 0);
}

function invitationCount(
  guests: Guest[],
  status: InvitationStatus,
): number {
  return sumGuestHeads(guests, (guest) => guest.invitation_status === status);
}

function taskCount(tasks: Task[], status: TaskStatus): number {
  return tasks.filter((task) => task.status === status).length;
}

function budgetTotals(items: BudgetItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.agreed += Number(item.actual_amount);
      acc.paid += Number(item.paid_amount);
      acc.plannedItems += Number(item.planned_amount);
      return acc;
    },
    { agreed: 0, paid: 0, plannedItems: 0 },
  );
}

function seatingStats(tables: SeatingTable[], guests: Guest[]) {
  const capacity = tables.reduce((sum, table) => sum + table.capacity, 0);
  const assigned = sumGuestHeads(guests, (guest) => guest.table_id != null);
  const total = sumGuestHeads(guests);
  return {
    tables: tables.length,
    capacity,
    assigned,
    unassigned: total - assigned,
  };
}

/**
 * Efikasni dashboard agregati: paralelni select-i samo potrebnih tabela,
 * agregacija u memoriji (bez N+1).
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  const wedding = await getWedding();
  if (!wedding) return null;

  const today = new Date().toISOString().slice(0, 10);

  const [guests, tables, tasks, budgetItems, vendors, timeline, notes] =
    await Promise.all([
      getGuests(wedding.id),
      getTables(wedding.id),
      getTasks(wedding.id),
      getBudgetItems(wedding.id),
      getVendors(wedding.id),
      getTimelineItems(wedding.id),
      getNotes(wedding.id),
    ]);

  const guestStats = {
    total: sumGuestHeads(guests),
    confirmed: invitationCount(guests, "confirmed"),
    pending: invitationCount(guests, "pending"),
    declined: invitationCount(guests, "declined"),
    bride: sumGuestHeads(guests, (guest) => guest.side === "bride"),
    groom: sumGuestHeads(guests, (guest) => guest.side === "groom"),
    brideParents: sumGuestHeads(
      guests,
      (guest) => guest.side === "bride_parents",
    ),
    groomParents: sumGuestHeads(
      guests,
      (guest) => guest.side === "groom_parents",
    ),
  };

  const totals = budgetTotals(budgetItems);

  const taskStats = {
    total: tasks.length,
    completed: taskCount(tasks, "completed"),
    remaining: tasks.filter((task) => task.status !== "completed").length,
    overdue: tasks.filter(
      (task) =>
        task.status !== "completed" &&
        task.deadline != null &&
        task.deadline < today,
    ).length,
  };

  const categoryMap = new Map<string, number>();
  for (const item of budgetItems) {
    categoryMap.set(
      item.category,
      (categoryMap.get(item.category) ?? 0) + Number(item.planned_amount),
    );
  }

  return {
    wedding,
    guests: guestStats,
    budget: {
      planned: Number(wedding.planned_budget),
      agreed: totals.agreed,
      paid: totals.paid,
      remaining: totals.agreed - totals.paid,
    },
    tasks: taskStats,
    seating: seatingStats(tables, guests),
    vendors: { total: vendors.length },
    timeline: {
      total: timeline.length,
      completed: timeline.filter((item) => item.completed).length,
      upcoming: timeline.filter(
        (item) => !item.completed && item.event_date >= today,
      ).length,
    },
    notes: { total: notes.length },
    budgetByCategory: Array.from(categoryMap.entries()).map(
      ([category, value]) => ({ category, value }),
    ),
    guestStatusChart: [
      { name: "Potvrđeni", value: guestStats.confirmed },
      { name: "Na čekanju", value: guestStats.pending },
      { name: "Odbili", value: guestStats.declined },
    ],
    sideChart: [
      { name: "Mlada", value: guestStats.bride },
      { name: "Mladoženja", value: guestStats.groom },
      { name: "Mladini roditelji", value: guestStats.brideParents },
      { name: "Mladoženjini roditelji", value: guestStats.groomParents },
    ],
    taskProgress: [
      { name: "Završeni", value: taskStats.completed },
      { name: "Preostali", value: taskStats.remaining },
    ],
  };
}

/** Alias za kompatibilnost sa starijim importima. */
export const getDashboardAggregates = getDashboardStats;
