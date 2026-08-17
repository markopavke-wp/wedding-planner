import { clsx, type ClassValue } from "clsx";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { srLatn } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import type { Guest } from "@/types/database";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return format(parseISO(value), "d. MMM yyyy.", { locale: srLatn });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return format(parseISO(value), "d. MMM yyyy. HH:mm", { locale: srLatn });
}

export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  return differenceInCalendarDays(parseISO(value), new Date());
}

export function guestFullName(guest: Pick<Guest, "first_name" | "last_name">): string {
  return `${guest.first_name} ${guest.last_name}`.trim();
}

export function guestHeadcount(guest: Pick<Guest, "plus_one" | "children_count">): number {
  return 1 + (guest.plus_one ? 1 : 0) + guest.children_count;
}

export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function sumBy<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((total, item) => total + getValue(item), 0);
}

export const APP_PATHS = [
  "/dashboard",
  "/guests",
  "/seating",
  "/budget",
  "/tasks",
  "/vendors",
  "/timeline",
  "/notes",
  "/settings",
] as const;

export function revalidateAppPaths(): string[] {
  return [...APP_PATHS];
}
