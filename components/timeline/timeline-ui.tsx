"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createTimelineItem,
  deleteTimelineItem,
  updateTimelineItem,
} from "@/lib/actions/timeline";
import { cn, formatDate } from "@/lib/utils";
import { timelineCreateSchema } from "@/lib/validation/timeline";
import type { TimelineItem } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = timelineCreateSchema.omit({ wedding_id: true });

type TimelineFormInput = z.input<typeof formSchema>;
type TimelineFormValues = z.output<typeof formSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  planning: "Priprema i plan",
  beauty: "Frizura i šminka",
  photography: "Fotografisanje",
  videography: "Snimanje",
  ceremony: "Ceremonija",
  reception: "Svečana sala",
  music: "Muzika",
  food: "Hrana i piće",
  transport: "Transport",
  other: "Ostalo",
};

const emptyForm: TimelineFormInput = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  category: "",
  completed: false,
};

function labelFor(value: string): string {
  return CATEGORY_LABELS[value] ?? value;
}

function timeLabel(value: string | null): string {
  return value ? value.slice(0, 5) : "—";
}

/** Nulti termini idu na kraj dana, isto kao u `getTimelineItems`. */
function sortItems(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort(
    (a, b) =>
      a.event_date.localeCompare(b.event_date) ||
      (a.event_time ?? "99:99").localeCompare(b.event_time ?? "99:99"),
  );
}

function mergeOptions(known: string[], existing: (string | null)[]): string[] {
  const values = new Set(known);
  for (const value of existing) {
    if (value) values.add(value);
  }
  return Array.from(values);
}

export function TimelineUI({
  weddingId,
  initialItems,
}: {
  weddingId: string;
  initialItems: TimelineItem[];
}) {
  const [items, setItems] = useState(() => sortItems(initialItems));
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [deleting, setDeleting] = useState<TimelineItem | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<TimelineFormInput, unknown, TimelineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm,
  });
  const errors = form.formState.errors;

  const categoryOptions = useMemo(
    () =>
      mergeOptions(
        Object.keys(CATEGORY_LABELS),
        items.map((item) => item.category),
      ),
    [items],
  );

  const completedCount = items.filter((item) => item.completed).length;

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory =
          categoryFilter === "all" || (item.category ?? "") === categoryFilter;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "completed" ? item.completed : !item.completed);
        return matchesCategory && matchesStatus;
      }),
    [items, categoryFilter, statusFilter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    for (const item of filtered) {
      const group = map.get(item.event_date);
      if (group) group.push(item);
      else map.set(item.event_date, [item]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function openCreate() {
    setEditing(null);
    form.reset(emptyForm);
    setOpen(true);
  }

  function openEdit(item: TimelineItem) {
    setEditing(item);
    form.reset({
      title: item.title,
      description: item.description ?? "",
      event_date: item.event_date,
      event_time: item.event_time ? item.event_time.slice(0, 5) : "",
      category: item.category ?? "",
      completed: item.completed,
    });
    setOpen(true);
  }

  function onSubmit(values: TimelineFormValues) {
    startTransition(async () => {
      const payload = { ...values, wedding_id: weddingId };
      const result = editing
        ? await updateTimelineItem({ ...payload, id: editing.id })
        : await createTimelineItem(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setItems((current) =>
        sortItems(
          editing
            ? current.map((item) =>
                item.id === result.data.id ? result.data : item,
              )
            : [...current, result.data],
        ),
      );
      toast.success(editing ? "Stavka ažurirana" : "Stavka dodata");
      setOpen(false);
    });
  }

  function toggleCompleted(item: TimelineItem) {
    startTransition(async () => {
      const result = await updateTimelineItem({
        id: item.id,
        wedding_id: weddingId,
        completed: !item.completed,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setItems((current) =>
        current.map((current_) =>
          current_.id === result.data.id ? result.data : current_,
        ),
      );
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const itemId = deleting.id;
    startTransition(async () => {
      const result = await deleteTimelineItem(weddingId, itemId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setItems((current) => current.filter((item) => item.id !== itemId));
      toast.success("Stavka obrisana");
      setDeleting(null);
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Timeline
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold">
            Hronologija dana
          </h1>
          <p className="mt-2 text-sm text-muted">
            {items.length} stavki · Završeno {completedCount} · Preostalo{" "}
            {items.length - completedCount}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj stavku
        </Button>
      </header>

      <div className="card-premium space-y-5 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Sve kategorije</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {labelFor(category)}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Sve stavke</option>
            <option value="pending">Preostale</option>
            <option value="completed">Završene</option>
          </Select>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <CalendarDays className="h-8 w-8 text-accent" />
            <p className="text-sm text-muted">
              {items.length === 0
                ? "Timeline je još prazan."
                : "Nema stavki za zadate filtere."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(([date, groupItems]) => (
              <section key={date}>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {formatDate(date)}
                </h2>
                <ol className="mt-4 space-y-3 border-l border-border pl-5">
                  {groupItems.map((item) => (
                    <li key={item.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                          item.completed ? "bg-muted" : "bg-accent",
                        )}
                      />
                      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                              <Clock className="h-3.5 w-3.5 text-accent" />
                              {timeLabel(item.event_time)}
                            </span>
                            {item.category ? (
                              <Badge>{labelFor(item.category)}</Badge>
                            ) : null}
                          </div>
                          <h3
                            className={cn(
                              "text-base font-semibold",
                              item.completed && "text-muted line-through",
                            )}
                          >
                            {item.title}
                          </h3>
                          {item.description ? (
                            <p className="whitespace-pre-wrap text-sm text-muted">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <label className="mr-2 flex cursor-pointer items-center gap-2 text-xs text-muted">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleCompleted(item)}
                            />
                            Završeno
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Izmeni stavku"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Obriši stavku"
                            onClick={() => setDeleting(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Izmeni stavku" : "Nova stavka"}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Naziv" error={errors.title?.message}>
            <Input {...form.register("title")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Datum" error={errors.event_date?.message}>
              <Input type="date" {...form.register("event_date")} />
            </Field>
            <Field label="Vreme" error={errors.event_time?.message}>
              <Input type="time" {...form.register("event_time")} />
            </Field>
          </div>
          <Field label="Kategorija" error={errors.category?.message}>
            <Select {...form.register("category")}>
              <option value="">Bez kategorije</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {labelFor(category)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Opis" error={errors.description?.message}>
            <Textarea {...form.register("description")} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("completed")} /> Stavka je
            završena
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Čuvanje..." : "Sačuvaj"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(value) => !value && setDeleting(null)}
        title="Obriši stavku"
        description={`Da li ste sigurni da želite da obrišete „${deleting?.title ?? ""}”? Ova radnja se ne može poništiti.`}
        onConfirm={handleDelete}
        loading={pending}
      />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
