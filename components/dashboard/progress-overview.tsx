import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats } from "@/lib/queries";
import { formatCurrency, percent } from "@/lib/utils";

type Row = {
  label: string;
  detail: string;
  value: number;
};

function buildRows(stats: DashboardStats): Row[] {
  const budgetReference =
    stats.budget.planned > 0 ? stats.budget.planned : stats.budget.agreed;

  return [
    {
      label: "Potvrđeni dolasci",
      detail: `${stats.guests.confirmed} od ${stats.guests.total} gostiju`,
      value: percent(stats.guests.confirmed, stats.guests.total),
    },
    {
      label: "Ugovoreni budžet",
      detail: `${formatCurrency(stats.budget.agreed)} od ${formatCurrency(budgetReference)}`,
      value: percent(stats.budget.agreed, budgetReference),
    },
    {
      label: "Izmirene obaveze",
      detail: `${formatCurrency(stats.budget.paid)} plaćeno · ${formatCurrency(stats.budget.remaining)} preostalo`,
      value: percent(stats.budget.paid, stats.budget.agreed),
    },
    {
      label: "Završeni zadaci",
      detail: `${stats.tasks.completed} od ${stats.tasks.total} zadataka`,
      value: percent(stats.tasks.completed, stats.tasks.total),
    },
    {
      label: "Raspoređeni gosti",
      detail: `${stats.seating.assigned} mesta od ${stats.seating.capacity} kapaciteta`,
      value: percent(stats.seating.assigned, stats.seating.capacity),
    },
  ];
}

export function ProgressOverview({ stats }: { stats: DashboardStats }) {
  const rows = buildRows(stats);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          Napredak priprema
        </CardTitle>
        <CardDescription>
          Ključni pokazatelji organizacije na jednom mestu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {rows.map((row) => (
          <div key={row.label} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-sm font-medium">{row.label}</span>
              <span className="text-xs text-muted">{row.detail}</span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={row.value} className="flex-1" />
              <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted">
                {row.value}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
