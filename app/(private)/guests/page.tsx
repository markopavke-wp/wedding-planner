import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";

import { GuestsClient } from "@/components/guests/guests-client";
import { Card, CardContent } from "@/components/ui/card";
import { getGuests, getTables, getWedding } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Gosti | Wedding Planner",
  description:
    "Lista zvanica sa potvrdama, pratiocima, decom i raspodelom po stolovima.",
};

export default async function GuestsPage() {
  const wedding = await getWedding();

  if (!wedding) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Users className="h-6 w-6" />
            </span>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold">
                Nema podataka o venčanju
              </h1>
              <p className="text-sm text-muted">
                Unesite osnovne informacije o venčanju pre dodavanja gostiju.
              </p>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Otvori podešavanja
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [guests, tables] = await Promise.all([
    getGuests(wedding.id),
    getTables(wedding.id),
  ]);

  return (
    <GuestsClient weddingId={wedding.id} guests={guests} tables={tables} />
  );
}
