"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  guestFormSchema,
  guestToFormValues,
  emptyGuestForm,
  type GuestFormValues,
} from "@/components/guests/guest-form-schema";
import {
  GROUP_LABELS,
  GUEST_GROUPS,
  GUEST_SIDES,
  INVITATION_LABELS,
  INVITATION_STATUSES,
  NO_TABLE_VALUE,
  SIDE_LABELS,
} from "@/components/guests/guest-labels";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Guest, SeatingTable } from "@/types/database";

type GuestFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Guest | null;
  tables: SeatingTable[];
  isPending: boolean;
  onSubmit: (values: GuestFormValues) => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function GuestFormDialog({
  open,
  onOpenChange,
  guest,
  tables,
  isPending,
  onSubmit,
}: GuestFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: emptyGuestForm,
  });

  useEffect(() => {
    if (!open) return;
    reset(guest ? guestToFormValues(guest) : emptyGuestForm);
  }, [guest, open, reset]);

  const plusOne = useWatch({ control, name: "plus_one" });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={guest ? "Izmena podataka o gostu" : "Novi gost"}
      className="max-w-2xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="guest-first-name">Ime</Label>
              <Input
                id="guest-first-name"
                className="mt-1.5"
                autoComplete="given-name"
                {...register("first_name")}
              />
              <FieldError message={errors.first_name?.message} />
            </div>

            <div>
              <Label htmlFor="guest-last-name">Prezime</Label>
              <Input
                id="guest-last-name"
                className="mt-1.5"
                autoComplete="family-name"
                {...register("last_name")}
              />
              <FieldError message={errors.last_name?.message} />
            </div>

            <div>
              <Label htmlFor="guest-side">Strana</Label>
              <Select id="guest-side" className="mt-1.5" {...register("side")}>
                {GUEST_SIDES.map((side) => (
                  <option key={side} value={side}>
                    {SIDE_LABELS[side]}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.side?.message} />
            </div>

            <div>
              <Label htmlFor="guest-group">Grupa</Label>
              <Select
                id="guest-group"
                className="mt-1.5"
                {...register("group_name")}
              >
                {GUEST_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {GROUP_LABELS[group]}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.group_name?.message} />
            </div>

            <div>
              <Label htmlFor="guest-status">Status pozivnice</Label>
              <Select
                id="guest-status"
                className="mt-1.5"
                {...register("invitation_status")}
              >
                {INVITATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {INVITATION_LABELS[status]}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.invitation_status?.message} />
            </div>

            <div>
              <Label htmlFor="guest-table">Sto</Label>
              <Select
                id="guest-table"
                className="mt-1.5"
                {...register("table_id")}
              >
                <option value={NO_TABLE_VALUE}>Bez stola</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} ({table.capacity} mesta)
                  </option>
                ))}
              </Select>
              <FieldError message={errors.table_id?.message} />
            </div>

            <div>
              <Label htmlFor="guest-phone">Telefon</Label>
              <Input
                id="guest-phone"
                className="mt-1.5"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+381 60 123 4567"
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>

            <div>
              <Label htmlFor="guest-children">Broj dece</Label>
              <Input
                id="guest-children"
                className="mt-1.5"
                type="number"
                min={0}
                max={20}
                step={1}
                {...register("children_count")}
              />
              <FieldError message={errors.children_count?.message} />
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-[var(--accent)]"
                {...register("plus_one")}
              />
              Dolazi sa pratiocem
            </label>

            {plusOne ? (
              <div className="mt-3">
                <Label htmlFor="guest-plus-one-name">Ime pratioca</Label>
                <Input
                  id="guest-plus-one-name"
                  className="mt-1.5"
                  {...register("plus_one_name")}
                />
                <FieldError message={errors.plus_one_name?.message} />
              </div>
            ) : null}
          </div>

          <div>
            <Label htmlFor="guest-notes">Napomena</Label>
            <Textarea
              id="guest-notes"
              className="mt-1.5"
              placeholder="Alergije, prevoz, smeštaj..."
              {...register("notes")}
            />
            <FieldError message={errors.notes?.message} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Otkaži
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Čuvanje...
              </>
            ) : guest ? (
              "Sačuvaj izmene"
            ) : (
              "Dodaj gosta"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
