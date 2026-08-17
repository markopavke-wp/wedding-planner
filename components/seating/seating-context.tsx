"use client";

import {
  createContext,
  useContext,
  type DragEvent,
  type ReactNode,
} from "react";

import type { SeatingTable } from "@/types/database";

/** Sopstveni MIME tip sprečava da plan sale prihvati bilo kakav spoljni drop. */
export const GUEST_MIME_TYPE = "application/x-wedding-guest";

export function startGuestDrag(
  event: DragEvent<HTMLElement>,
  guestId: string,
): void {
  event.dataTransfer.setData(GUEST_MIME_TYPE, guestId);
  event.dataTransfer.setData("text/plain", guestId);
  event.dataTransfer.effectAllowed = "move";
}

export function readDraggedGuestId(
  event: DragEvent<HTMLElement>,
): string | null {
  const guestId =
    event.dataTransfer.getData(GUEST_MIME_TYPE) ||
    event.dataTransfer.getData("text/plain");
  return guestId.length > 0 ? guestId : null;
}

export function allowGuestDrop(event: DragEvent<HTMLElement>): void {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

export interface SeatingActions {
  /** `tableId === null` uklanja gosta sa stola. */
  assignGuest: (guestId: string, tableId: string | null) => void;
  editTable: (table: SeatingTable) => void;
  deleteTable: (table: SeatingTable) => void;
  rotateTable: (table: SeatingTable) => void;
}

export interface SeatingContextValue {
  actions: SeatingActions;
  draggedGuestId: string | null;
  setDraggedGuestId: (guestId: string | null) => void;
  isPending: boolean;
}

const SeatingContext = createContext<SeatingContextValue | null>(null);

/**
 * Čvorovi stolova se renderuju unutar `ReactFlow`, pa im akcije i stanje
 * prevlačenja prosleđujemo kontekstom umesto kroz `node.data`.
 */
export function SeatingProvider({
  value,
  children,
}: {
  value: SeatingContextValue;
  children: ReactNode;
}) {
  return (
    <SeatingContext.Provider value={value}>{children}</SeatingContext.Provider>
  );
}

export function useSeating(): SeatingContextValue {
  const context = useContext(SeatingContext);
  if (context === null) {
    throw new Error("useSeating zahteva SeatingProvider u drvetu komponenti.");
  }
  return context;
}
