"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Users } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateWedding } from "@/lib/actions/wedding";
import { daysUntil, formatDate } from "@/lib/utils";
import { weddingCreateSchema } from "@/lib/validation/wedding";
import type { Profile, ProfileRole, Wedding } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = weddingCreateSchema;

type WeddingFormInput = z.input<typeof formSchema>;
type WeddingFormValues = z.output<typeof formSchema>;

const ROLE_LABELS: Record<ProfileRole, string> = {
  admin: "Administrator",
  editor: "Urednik",
};

function initialFor(profile: Profile): string {
  return (profile.full_name ?? profile.email ?? "?").trim().slice(0, 1).toUpperCase();
}

export function SettingsUI({
  wedding,
  profiles,
}: {
  wedding: Wedding;
  profiles: Profile[];
}) {
  const [current, setCurrent] = useState(wedding);
  const [pending, startTransition] = useTransition();

  const form = useForm<WeddingFormInput, unknown, WeddingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: wedding.title,
      wedding_date: wedding.wedding_date,
      venue: wedding.venue ?? "",
      city: wedding.city ?? "",
      planned_budget: Number(wedding.planned_budget),
      notes: wedding.notes ?? "",
    },
  });
  const errors = form.formState.errors;

  const countdown = daysUntil(current.wedding_date);

  function onSubmit(values: WeddingFormValues) {
    startTransition(async () => {
      const result = await updateWedding({ ...values, id: current.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCurrent(result.data);
      form.reset({
        title: result.data.title,
        wedding_date: result.data.wedding_date,
        venue: result.data.venue ?? "",
        city: result.data.city ?? "",
        planned_budget: Number(result.data.planned_budget),
        notes: result.data.notes ?? "",
      });
      toast.success("Podešavanja sačuvana");
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Podešavanja
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold">
          Detalji svadbe
        </h1>
        <p className="mt-2 text-sm text-muted">
          {formatDate(current.wedding_date)}
          {countdown !== null
            ? countdown >= 0
              ? ` · ${countdown} dana do svadbe`
              : " · svadba je prošla"
            : null}
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <form
          className="card-premium space-y-4 p-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Naziv svadbe"
              error={errors.title?.message}
              className="sm:col-span-2"
            >
              <Input {...form.register("title")} />
            </Field>
            <Field label="Datum svadbe" error={errors.wedding_date?.message}>
              <Input type="date" {...form.register("wedding_date")} />
            </Field>
            <Field label="Planirani budžet" error={errors.planned_budget?.message}>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...form.register("planned_budget")}
              />
            </Field>
            <Field label="Sala / lokacija" error={errors.venue?.message}>
              <Input {...form.register("venue")} />
            </Field>
            <Field label="Grad" error={errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
          </div>

          <Field label="Napomena" error={errors.notes?.message}>
            <Textarea {...form.register("notes")} />
          </Field>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !form.formState.isDirty}>
              {pending ? "Čuvanje..." : "Sačuvaj izmene"}
            </Button>
          </div>
        </form>

        <section className="card-premium space-y-4 p-6">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-accent-soft p-2.5 text-accent">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Korisnici</h2>
              <p className="mt-1 text-sm text-muted">
                Nalozi koji imaju pristup planeru.
              </p>
            </div>
          </div>

          {profiles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              Nema dostupnih profila.
            </p>
          ) : (
            <ul className="space-y-3">
              {profiles.map((profile) => (
                <li
                  key={profile.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {initialFor(profile)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {profile.full_name ?? "Korisnik"}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {profile.email ?? "Email nije dostupan"}
                    </p>
                  </div>
                  <Badge>{ROLE_LABELS[profile.role] ?? profile.role}</Badge>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted">
            Lista je samo za pregled. Novi nalozi se dodaju u Supabase Auth.
          </p>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
