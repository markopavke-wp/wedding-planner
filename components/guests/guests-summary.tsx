import {
  Armchair,
  CircleCheck,
  CircleHelp,
  CircleX,
  UserPlus,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { cn, guestHeadcount } from "@/lib/utils";
import type { Guest } from "@/types/database";

type SummaryTile = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

export function GuestsSummary({ guests }: { guests: Guest[] }) {
  const headcount = guests.reduce((sum, guest) => sum + guestHeadcount(guest), 0);
  const confirmed = guests.filter(
    (guest) => guest.invitation_status === "confirmed",
  ).length;
  const pending = guests.filter(
    (guest) => guest.invitation_status === "pending",
  ).length;
  const declined = guests.filter(
    (guest) => guest.invitation_status === "declined",
  ).length;
  const companions = guests.reduce(
    (sum, guest) => sum + (guest.plus_one ? 1 : 0) + guest.children_count,
    0,
  );
  const seated = guests.filter((guest) => guest.table_id !== null).length;

  const tiles: SummaryTile[] = [
    {
      label: "Ukupno mesta",
      value: String(headcount),
      icon: Users,
      tone: "bg-accent-soft text-accent",
    },
    {
      label: "Potvrđeni",
      value: String(confirmed),
      icon: CircleCheck,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Na čekanju",
      value: String(pending),
      icon: CircleHelp,
      tone: "bg-warning/10 text-warning",
    },
    {
      label: "Odbili",
      value: String(declined),
      icon: CircleX,
      tone: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Pratioci i deca",
      value: String(companions),
      icon: UserPlus,
      tone: "bg-accent-soft text-accent",
    },
    {
      label: "Za stolom",
      value: `${seated} / ${guests.length}`,
      icon: Armchair,
      tone: "bg-secondary text-secondary-foreground",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              tile.tone,
            )}
          >
            <tile.icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold leading-none tabular-nums">
              {tile.value}
            </p>
            <p className="truncate text-xs text-muted">{tile.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
