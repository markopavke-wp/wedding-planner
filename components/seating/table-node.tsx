"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { Pencil, RotateCw, Trash2, TriangleAlert } from "lucide-react";
import { memo, type CSSProperties } from "react";

import { cn, guestFullName } from "@/lib/utils";
import type { Guest, SeatingTable } from "@/types/database";

import { getTableSize, type TableSize } from "./geometry";
import {
  allowGuestDrop,
  readDraggedGuestId,
  startGuestDrag,
  useSeating,
} from "./seating-context";
import { TABLE_SHAPE_LABELS, TABLE_SIDE_SURFACE_CLASSES } from "./types";

export type TableNodeData = {
  table: SeatingTable;
  guests: Guest[];
  occupied: number;
  freeSeats: number;
  occupancyPercent: number;
  isOverCapacity: boolean;
  isFull: boolean;
};

export type TableFlowNode = Node<TableNodeData, "table">;

type SeatLabel = {
  key: string;
  guestId: string;
  shortName: string;
  fullName: string;
};

function shortName(firstName: string, lastName: string): string {
  const initial = lastName.trim().charAt(0);
  return initial.length > 0 ? `${firstName} ${initial}.` : firstName;
}

/** Jedan zapis gosta može zauzimati više fizičkih mesta. */
function buildSeatLabels(guests: readonly Guest[]): SeatLabel[] {
  return guests.flatMap((guest) => {
    const owner = guest.first_name;
    const labels: SeatLabel[] = [
      {
        key: guest.id,
        guestId: guest.id,
        shortName: shortName(guest.first_name, guest.last_name),
        fullName: guestFullName(guest),
      },
    ];

    if (guest.plus_one) {
      const plusOne = guest.plus_one_name?.trim() || `Pratilac (${owner})`;
      labels.push({
        key: `${guest.id}-plus-one`,
        guestId: guest.id,
        shortName: plusOne,
        fullName: `${plusOne} — pratilac gosta ${guestFullName(guest)}`,
      });
    }

    for (let index = 0; index < guest.children_count; index += 1) {
      const child = `Dete ${index + 1} (${owner})`;
      labels.push({
        key: `${guest.id}-child-${index}`,
        guestId: guest.id,
        shortName: child,
        fullName: `${child} — uz gosta ${guestFullName(guest)}`,
      });
    }

    return labels;
  });
}

function roundSeatPosition(
  index: number,
  count: number,
  size: TableSize,
): CSSProperties {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  const radiusX = size.width / 2 + 28;
  const radiusY = size.height / 2 + 25;

  return {
    left: size.width / 2 + Math.cos(angle) * radiusX,
    top: size.height / 2 + Math.sin(angle) * radiusY,
    transform: "translate(-50%, -50%)",
  };
}

function rectangularSeatPosition(
  index: number,
  count: number,
  size: TableSize,
): CSSProperties {
  const offset = 26;
  const width = size.width + offset * 2;
  const height = size.height + offset * 2;
  const perimeter = 2 * (width + height);
  let distance = ((index + 0.5) / count) * perimeter;
  let x: number;
  let y: number;

  if (distance < width) {
    x = distance;
    y = 0;
  } else if ((distance -= width) < height) {
    x = width;
    y = distance;
  } else if ((distance -= height) < width) {
    x = width - distance;
    y = height;
  } else {
    distance -= width;
    x = 0;
    y = height - distance;
  }

  return {
    left: x - offset,
    top: y - offset,
    transform: "translate(-50%, -50%)",
  };
}

function TableNodeComponent({ data, selected }: NodeProps<TableFlowNode>) {
  const {
    table,
    guests,
    occupied,
    occupancyPercent,
    isOverCapacity,
    isFull,
  } = data;
  const { actions, draggedGuestId, setDraggedGuestId } = useSeating();
  const size = getTableSize(table);
  const isHeadTable = table.shape === "head_table";
  const isDropTarget = draggedGuestId !== null;
  const seatLabels = buildSeatLabels(guests);

  return (
    <div
      style={{ width: size.width, height: size.height }}
      className="group relative"
      aria-label={`${TABLE_SHAPE_LABELS[table.shape]} ${table.name}, ${occupied} od ${table.capacity} mesta`}
      onDragOver={isDropTarget ? allowGuestDrop : undefined}
      onDrop={(event) => {
        const guestId = readDraggedGuestId(event);
        if (guestId === null) return;
        event.preventDefault();
        event.stopPropagation();
        actions.assignGuest(guestId, table.id);
      }}
    >
      <div
        aria-hidden
        style={{ transform: `rotate(${Number(table.rotation)}deg)` }}
        className={cn(
          "absolute inset-0 border-2 bg-card shadow-soft transition",
          table.shape === "round" ? "rounded-full" : "rounded-2xl",
          table.side !== null
            ? TABLE_SIDE_SURFACE_CLASSES[table.side]
            : isHeadTable
              ? "border-accent bg-accent-soft"
              : "border-border",
          isOverCapacity && "border-destructive",
          !isOverCapacity && isFull && "border-warning",
          selected && "ring-4 ring-accent/25",
          isDropTarget && "border-dashed border-accent",
        )}
      />

      <div className="relative flex h-full cursor-grab flex-col items-center justify-center gap-1 px-3 py-2 text-center">
        <p className="max-w-full truncate text-sm font-semibold">
          {table.name}
        </p>

        <p
          className={cn(
            "text-xs font-medium tabular-nums",
            isOverCapacity ? "text-destructive" : "text-muted",
          )}
        >
          {occupied} / {table.capacity} mesta
        </p>

        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOverCapacity
                ? "bg-destructive"
                : isFull
                  ? "bg-warning"
                  : "bg-accent",
            )}
            style={{ width: `${Math.min(100, occupancyPercent)}%` }}
          />
        </div>

        {isOverCapacity ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
            <TriangleAlert className="h-3 w-3" />
            Prepunjeno
          </span>
        ) : table.side !== null ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              table.side === "bride" && "bg-rose-200/80 text-rose-900 dark:bg-rose-900/60 dark:text-rose-100",
              table.side === "groom" && "bg-sky-200/80 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100",
              table.side === "mixed" && "bg-amber-200/80 text-amber-950 dark:bg-amber-900/60 dark:text-amber-100",
            )}
          >
            {table.side === "bride"
              ? "Mlada"
              : table.side === "groom"
                ? "Mladoženja"
                : "Mešovito"}
          </span>
        ) : null}
      </div>

      {seatLabels.length > 0 ? (
        <ul
          className="nodrag pointer-events-none absolute inset-0 z-20 overflow-visible"
          aria-label={`Raspoređena mesta za ${table.name}`}
        >
          {seatLabels.map((seat, index) => (
            <li
              key={seat.key}
              style={
                table.shape === "round"
                  ? roundSeatPosition(index, seatLabels.length, size)
                  : rectangularSeatPosition(index, seatLabels.length, size)
              }
              className="pointer-events-auto absolute"
            >
              <span
                draggable
                onDragStart={(event) => {
                  startGuestDrag(event, seat.guestId);
                  setDraggedGuestId(seat.guestId);
                }}
                onDragEnd={() => setDraggedGuestId(null)}
                title={`${seat.fullName} — prevucite da premestite`}
                className="block w-[58px] cursor-grab truncate rounded-full border border-accent/35 bg-background px-1.5 py-1 text-center text-[9px] font-medium leading-none text-foreground shadow-soft"
              >
                {seat.shortName}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Na dodiru se akcije koriste iz velike trake ispod plana. */}
      <div className="nodrag absolute right-1 top-1 z-30 hidden gap-1 opacity-0 transition md:flex md:group-hover:opacity-100 md:focus-within:opacity-100">
        <button
          type="button"
          aria-label="Rotiraj sto"
          title="Rotiraj sto"
          onClick={(event) => {
            event.stopPropagation();
            actions.rotateTable(table);
          }}
          className="rounded-full border border-border bg-card p-1 text-muted shadow-soft hover:text-foreground"
        >
          <RotateCw className="h-3 w-3" />
        </button>
        <button
          type="button"
          aria-label="Izmeni sto"
          title="Izmeni sto"
          onClick={(event) => {
            event.stopPropagation();
            actions.editTable(table);
          }}
          className="rounded-full border border-border bg-card p-1 text-muted shadow-soft hover:text-foreground"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          aria-label="Obriši sto"
          title="Obriši sto"
          onClick={(event) => {
            event.stopPropagation();
            actions.deleteTable(table);
          }}
          className="rounded-full border border-border bg-card p-1 text-muted shadow-soft hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export const TableNode = memo(TableNodeComponent);
