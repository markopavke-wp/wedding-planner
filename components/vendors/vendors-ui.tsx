"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AtSign,
  Globe,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Store,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createVendor, deleteVendor, updateVendor } from "@/lib/actions/vendor";
import { formatCurrency, formatDate } from "@/lib/utils";
import { vendorCreateSchema } from "@/lib/validation/vendor";
import type { Vendor } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = vendorCreateSchema.omit({ wedding_id: true });

type VendorFormInput = z.input<typeof formSchema>;
type VendorFormValues = z.output<typeof formSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  Venue: "Sala i prostor",
  Catering: "Ketering",
  Photographer: "Fotograf",
  Videographer: "Snimatelj",
  Band: "Bend i orkestar",
  Music: "Muzika i DJ",
  Flowers: "Cveće",
  Decoration: "Dekoracija",
  Cake: "Torta i slatkiši",
  Beauty: "Frizura i šminka",
  Attire: "Odeća i obuća",
  Rings: "Prstenje",
  Invitations: "Pozivnice i štampa",
  Transport: "Transport",
  Other: "Ostalo",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "U planu",
  contacted: "Kontaktiran",
  confirmed: "Potvrđen",
  deposit_paid: "Avans plaćen",
  partially_paid: "Delimično plaćeno",
  paid: "Plaćeno u celosti",
  cancelled: "Otkazan",
};

const emptyForm: VendorFormInput = {
  category: "Venue",
  company_name: "",
  contact_person: "",
  phone: "",
  email: "",
  instagram: "",
  website: "",
  agreed_price: 0,
  deposit: 0,
  payment_due_date: "",
  status: "planned",
  notes: "",
};

function labelFor(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}

function toAmount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Poznate vrednosti + sve što već postoji u bazi, da izmena ne pregazi zatečenu kategoriju. */
function mergeOptions(known: string[], existing: (string | null)[]): string[] {
  const values = new Set(known);
  for (const value of existing) {
    if (value) values.add(value);
  }
  return Array.from(values);
}

export function VendorsUI({
  weddingId,
  initialVendors,
}: {
  weddingId: string;
  initialVendors: Vendor[];
}) {
  const [vendors, setVendors] = useState(initialVendors);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState<Vendor | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<VendorFormInput, unknown, VendorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm,
  });
  const errors = form.formState.errors;

  const categoryOptions = useMemo(
    () =>
      mergeOptions(
        Object.keys(CATEGORY_LABELS),
        vendors.map((vendor) => vendor.category),
      ).sort((a, b) =>
        labelFor(CATEGORY_LABELS, a).localeCompare(
          labelFor(CATEGORY_LABELS, b),
          "sr",
        ),
      ),
    [vendors],
  );

  const statusOptions = useMemo(
    () =>
      mergeOptions(
        Object.keys(STATUS_LABELS),
        vendors.map((vendor) => vendor.status),
      ),
    [vendors],
  );

  const totals = useMemo(
    () =>
      vendors.reduce(
        (acc, vendor) => ({
          agreed: acc.agreed + Number(vendor.agreed_price),
          deposit: acc.deposit + Number(vendor.deposit),
          remaining: acc.remaining + Number(vendor.remaining_amount),
        }),
        { agreed: 0, deposit: 0, remaining: 0 },
      ),
    [vendors],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vendors
      .filter((vendor) => {
        const haystack = [
          vendor.company_name,
          vendor.contact_person,
          vendor.email,
          vendor.phone,
        ]
          .filter((value): value is string => !!value)
          .join(" ")
          .toLowerCase();
        const matchesSearch = !query || haystack.includes(query);
        const matchesCategory =
          categoryFilter === "all" || vendor.category === categoryFilter;
        const matchesStatus =
          statusFilter === "all" || (vendor.status ?? "") === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category, "sr") ||
          a.company_name.localeCompare(b.company_name, "sr"),
      );
  }, [vendors, search, categoryFilter, statusFilter]);

  const agreedPriceValue = useWatch({ control: form.control, name: "agreed_price" });
  const depositValue = useWatch({ control: form.control, name: "deposit" });
  const agreedPrice = toAmount(agreedPriceValue);
  const deposit = toAmount(depositValue);
  const remainingPreview = Math.max(agreedPrice - deposit, 0);

  function openCreate() {
    setEditing(null);
    form.reset(emptyForm);
    setOpen(true);
  }

  function openEdit(vendor: Vendor) {
    setEditing(vendor);
    form.reset({
      category: vendor.category,
      company_name: vendor.company_name,
      contact_person: vendor.contact_person ?? "",
      phone: vendor.phone ?? "",
      email: vendor.email ?? "",
      instagram: vendor.instagram ?? "",
      website: vendor.website ?? "",
      agreed_price: Number(vendor.agreed_price),
      deposit: Number(vendor.deposit),
      payment_due_date: vendor.payment_due_date ?? "",
      status: vendor.status ?? "",
      notes: vendor.notes ?? "",
    });
    setOpen(true);
  }

  function onSubmit(values: VendorFormValues) {
    startTransition(async () => {
      const agreed = values.agreed_price ?? 0;
      const paidDeposit = values.deposit ?? 0;
      const payload = {
        ...values,
        wedding_id: weddingId,
        remaining_amount: Math.max(agreed - paidDeposit, 0),
      };

      const result = editing
        ? await updateVendor({ ...payload, id: editing.id })
        : await createVendor(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setVendors((current) =>
        editing
          ? current.map((vendor) =>
              vendor.id === result.data.id ? result.data : vendor,
            )
          : [...current, result.data],
      );
      toast.success(editing ? "Dobavljač ažuriran" : "Dobavljač dodat");
      setOpen(false);
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const vendorId = deleting.id;
    startTransition(async () => {
      const result = await deleteVendor(weddingId, vendorId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setVendors((current) => current.filter((vendor) => vendor.id !== vendorId));
      toast.success("Dobavljač obrisan");
      setDeleting(null);
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Dobavljači
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold">
            Saradnici i ponude
          </h1>
          <p className="mt-2 text-sm text-muted">
            {vendors.length} dobavljača · Ugovoreno {formatCurrency(totals.agreed)} ·
            Avans {formatCurrency(totals.deposit)} · Ostatak{" "}
            {formatCurrency(totals.remaining)}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj dobavljača
        </Button>
      </header>

      <div className="card-premium space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Pretraga po nazivu, kontaktu ili telefonu..."
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
                {labelFor(CATEGORY_LABELS, category)}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Svi statusi</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {labelFor(STATUS_LABELS, status)}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <Store className="h-8 w-8 text-accent" />
            <p className="text-sm text-muted">
              {vendors.length === 0
                ? "Još nema unetih dobavljača."
                : "Nema dobavljača za zadate filtere."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((vendor) => (
              <article
                key={vendor.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Badge>{labelFor(CATEGORY_LABELS, vendor.category)}</Badge>
                    <h2 className="mt-2 truncate text-lg font-semibold">
                      {vendor.company_name}
                    </h2>
                    {vendor.status ? (
                      <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                        {labelFor(STATUS_LABELS, vendor.status)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Izmeni dobavljača"
                      onClick={() => openEdit(vendor)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Obriši dobavljača"
                      onClick={() => setDeleting(vendor)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted">
                  {vendor.contact_person ? (
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-accent" />
                      <span className="truncate text-foreground">
                        {vendor.contact_person}
                      </span>
                    </p>
                  ) : null}
                  {vendor.phone ? (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-accent" />
                      <a className="truncate hover:text-accent" href={`tel:${vendor.phone}`}>
                        {vendor.phone}
                      </a>
                    </p>
                  ) : null}
                  {vendor.email ? (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-accent" />
                      <a
                        className="truncate hover:text-accent"
                        href={`mailto:${vendor.email}`}
                      >
                        {vendor.email}
                      </a>
                    </p>
                  ) : null}
                  {vendor.instagram ? (
                    <p className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 shrink-0 text-accent" />
                      <span className="truncate">{vendor.instagram}</span>
                    </p>
                  ) : null}
                  {vendor.website ? (
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-accent" />
                      <a
                        className="truncate hover:text-accent"
                        href={vendor.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {vendor.website}
                      </a>
                    </p>
                  ) : null}
                </div>

                <dl className="grid grid-cols-3 gap-3 rounded-xl bg-accent-soft px-4 py-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Ugovoreno</dt>
                    <dd className="mt-0.5 font-medium">
                      {formatCurrency(Number(vendor.agreed_price))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Avans</dt>
                    <dd className="mt-0.5 font-medium">
                      {formatCurrency(Number(vendor.deposit))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Ostatak</dt>
                    <dd className="mt-0.5 font-medium">
                      {formatCurrency(Number(vendor.remaining_amount))}
                    </dd>
                  </div>
                </dl>

                <p className="text-xs text-muted">
                  Rok za plaćanje: {formatDate(vendor.payment_due_date)}
                </p>

                {vendor.notes ? (
                  <p className="whitespace-pre-wrap text-sm text-muted">
                    {vendor.notes}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Izmeni dobavljača" : "Novi dobavljač"}
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Naziv firme" error={errors.company_name?.message}>
              <Input {...form.register("company_name")} />
            </Field>
            <Field label="Kategorija" error={errors.category?.message}>
              <Select {...form.register("category")}>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {labelFor(CATEGORY_LABELS, category)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Kontakt osoba" error={errors.contact_person?.message}>
              <Input {...form.register("contact_person")} />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <Select {...form.register("status")}>
                <option value="">Bez statusa</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {labelFor(STATUS_LABELS, status)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Telefon" error={errors.phone?.message}>
              <Input {...form.register("phone")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
            <Field label="Instagram" error={errors.instagram?.message}>
              <Input placeholder="@nalog" {...form.register("instagram")} />
            </Field>
            <Field label="Sajt" error={errors.website?.message}>
              <Input placeholder="https://" {...form.register("website")} />
            </Field>
            <Field label="Ugovorena cena" error={errors.agreed_price?.message}>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...form.register("agreed_price")}
              />
            </Field>
            <Field label="Avans" error={errors.deposit?.message}>
              <Input type="number" min="0" step="0.01" {...form.register("deposit")} />
            </Field>
            <Field label="Rok za plaćanje" error={errors.payment_due_date?.message}>
              <Input type="date" {...form.register("payment_due_date")} />
            </Field>
            <div>
              <Label>Ostatak za plaćanje</Label>
              <p className="mt-1.5 rounded-xl border border-border bg-accent-soft px-3 py-2.5 text-sm font-medium">
                {formatCurrency(remainingPreview)}
              </p>
            </div>
          </div>

          <Field label="Napomena" error={errors.notes?.message}>
            <Textarea {...form.register("notes")} />
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
        title="Obriši dobavljača"
        description={`Da li ste sigurni da želite da obrišete „${deleting?.company_name ?? ""}”? Ova radnja se ne može poništiti.`}
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
