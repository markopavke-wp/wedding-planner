"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, StickyNote, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createNote, deleteNote, updateNote } from "@/lib/actions/note";
import { formatDate } from "@/lib/utils";
import { noteCreateSchema } from "@/lib/validation/note";
import type { Note } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = noteCreateSchema.omit({ wedding_id: true });

type NoteFormInput = z.input<typeof formSchema>;
type NoteFormValues = z.output<typeof formSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  general: "Opšte",
  decoration: "Dekoracija",
  food: "Hrana i piće",
  music: "Muzika",
  logistics: "Logistika",
  guests: "Gosti",
  vendors: "Dobavljači",
  other: "Ostalo",
};

const emptyForm: NoteFormInput = {
  title: "",
  content: "",
  category: "",
};

function labelFor(value: string): string {
  return CATEGORY_LABELS[value] ?? value;
}

/** Najsvežije izmenjene beleške idu prvo, isto kao u `getNotes`. */
function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

function mergeOptions(known: string[], existing: (string | null)[]): string[] {
  const values = new Set(known);
  for (const value of existing) {
    if (value) values.add(value);
  }
  return Array.from(values);
}

export function NotesUI({
  weddingId,
  initialNotes,
}: {
  weddingId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState(() => sortNotes(initialNotes));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<NoteFormInput, unknown, NoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm,
  });
  const errors = form.formState.errors;

  const categoryOptions = useMemo(
    () =>
      mergeOptions(
        Object.keys(CATEGORY_LABELS),
        notes.map((note) => note.category),
      ),
    [notes],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      const haystack = `${note.title} ${note.content ?? ""}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesCategory =
        categoryFilter === "all" || (note.category ?? "") === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [notes, search, categoryFilter]);

  function openCreate() {
    setEditing(null);
    form.reset(emptyForm);
    setOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    form.reset({
      title: note.title,
      content: note.content ?? "",
      category: note.category ?? "",
    });
    setOpen(true);
  }

  function onSubmit(values: NoteFormValues) {
    startTransition(async () => {
      const payload = { ...values, wedding_id: weddingId };
      const result = editing
        ? await updateNote({ ...payload, id: editing.id })
        : await createNote(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setNotes((current) =>
        sortNotes(
          editing
            ? current.map((note) =>
                note.id === result.data.id ? result.data : note,
              )
            : [...current, result.data],
        ),
      );
      toast.success(editing ? "Beleška ažurirana" : "Beleška dodata");
      setOpen(false);
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const noteId = deleting.id;
    startTransition(async () => {
      const result = await deleteNote(weddingId, noteId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setNotes((current) => current.filter((note) => note.id !== noteId));
      toast.success("Beleška obrisana");
      setDeleting(null);
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Beleške
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold">
            Ideje i dogovori
          </h1>
          <p className="mt-2 text-sm text-muted">
            {notes.length} {notes.length === 1 ? "beleška" : "beležaka"} · Prikazano{" "}
            {filtered.length}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj belešku
        </Button>
      </header>

      <div className="card-premium space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Pretraga po naslovu i sadržaju..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
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
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <StickyNote className="h-8 w-8 text-accent" />
            <p className="text-sm text-muted">
              {notes.length === 0
                ? "Još nema beležaka."
                : "Nema beležaka za zadate filtere."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((note) => (
              <article
                key={note.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {note.category ? (
                      <Badge>{labelFor(note.category)}</Badge>
                    ) : null}
                    <h2 className="mt-2 text-lg font-semibold">{note.title}</h2>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Izmeni belešku"
                      onClick={() => openEdit(note)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Obriši belešku"
                      onClick={() => setDeleting(note)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {note.content ? (
                  <p className="whitespace-pre-wrap text-sm text-muted">
                    {note.content}
                  </p>
                ) : null}
                <p className="mt-auto text-xs text-muted">
                  Izmenjeno {formatDate(note.updated_at)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Izmeni belešku" : "Nova beleška"}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Naslov" error={errors.title?.message}>
            <Input {...form.register("title")} />
          </Field>
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
          <Field label="Sadržaj" error={errors.content?.message}>
            <Textarea className="min-h-40" {...form.register("content")} />
          </Field>

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
        title="Obriši belešku"
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
