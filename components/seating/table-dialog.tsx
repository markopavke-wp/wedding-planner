"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { SeatingTable, TableShape, TableSide } from "@/types/database";

import {
  MAX_TABLE_CAPACITY,
  MIN_TABLE_CAPACITY,
  NO_SIDE_LABEL,
  TABLE_SHAPES,
  TABLE_SHAPE_LABELS,
  TABLE_SIDES,
  TABLE_SIDE_LABELS,
} from "./types";

export interface TableFormValues {
  name: string;
  capacity: number;
  shape: TableShape;
  side: TableSide | null;
  notes: string | null;
}

interface FormState {
  name: string;
  capacity: string;
  shape: TableShape;
  side: TableSide | "none";
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  capacity: "8",
  shape: "round",
  side: "none",
  notes: "",
};

function toFormState(table: SeatingTable | null): FormState {
  if (table === null) return EMPTY_FORM;
  return {
    name: table.name,
    capacity: String(table.capacity),
    shape: table.shape,
    side: table.side ?? "none",
    notes: table.notes ?? "",
  };
}

export interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` znači kreiranje novog stola. */
  table: SeatingTable | null;
  isSaving: boolean;
  onSubmit: (values: TableFormValues) => void;
}

function TableForm({
  table,
  isSaving,
  onOpenChange,
  onSubmit,
}: Omit<TableDialogProps, "open">) {
  const [form, setForm] = useState<FormState>(() => toFormState(table));
  const [error, setError] = useState<string | null>(null);
  const isEditing = table !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (name.length === 0) {
      setError("Naziv stola je obavezan.");
      return;
    }

    const capacity = Number.parseInt(form.capacity, 10);
    if (
      Number.isNaN(capacity) ||
      capacity < MIN_TABLE_CAPACITY ||
      capacity > MAX_TABLE_CAPACITY
    ) {
      setError(
        `Broj mesta mora biti između ${MIN_TABLE_CAPACITY} i ${MAX_TABLE_CAPACITY}.`,
      );
      return;
    }

    const notes = form.notes.trim();
    setError(null);
    onSubmit({
      name,
      capacity,
      shape: form.shape,
      side: form.side === "none" ? null : form.side,
      notes: notes.length === 0 ? null : notes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="table-name">Naziv stola</Label>
        <Input
          id="table-name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="npr. Sto 1"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="table-capacity">Broj mesta</Label>
          <Input
            id="table-capacity"
            type="number"
            inputMode="numeric"
            min={MIN_TABLE_CAPACITY}
            max={MAX_TABLE_CAPACITY}
            value={form.capacity}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                capacity: event.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="table-shape">Oblik</Label>
          <Select
            id="table-shape"
            value={form.shape}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                shape: event.target.value as TableShape,
              }))
            }
          >
            {TABLE_SHAPES.map((shape) => (
              <option key={shape} value={shape}>
                {TABLE_SHAPE_LABELS[shape]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="table-side">Strana</Label>
        <Select
          id="table-side"
          value={form.side}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              side: event.target.value as TableSide | "none",
            }))
          }
        >
          <option value="none">{NO_SIDE_LABEL}</option>
          {TABLE_SIDES.map((side) => (
            <option key={side} value={side}>
              {TABLE_SIDE_LABELS[side]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="table-notes">Napomena</Label>
        <Input
          id="table-notes"
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="npr. blizu bine"
        />
      </div>

      {error !== null ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Otkaži
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Čuvanje..." : isEditing ? "Sačuvaj" : "Dodaj sto"}
        </Button>
      </div>
    </form>
  );
}

export function TableDialog({ open, table, ...props }: TableDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={props.onOpenChange}
      title={table === null ? "Novi sto" : "Izmena stola"}
    >
      {/* Ključ montira svež formular pri svakom otvaranju, pa polja ne pamte prethodni sto. */}
      <TableForm key={table?.id ?? "new"} table={table} {...props} />
    </Dialog>
  );
}
