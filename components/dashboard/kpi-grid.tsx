import { Armchair, ListChecks, Users, Wallet } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import type { DashboardStats } from "@/lib/queries";
import { formatCurrency, percent } from "@/lib/utils";

export function KpiGrid({ stats }: { stats: DashboardStats }) {
  const { guests, budget, tasks, seating } = stats;

  const budgetReference = budget.planned > 0 ? budget.planned : budget.agreed;
  const budgetUsage = percent(budget.agreed, budgetReference);
  const overBudget = budget.agreed > budgetReference && budgetReference > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Gosti"
        icon={Users}
        value={`${guests.confirmed} / ${guests.total}`}
        description={`${guests.pending} na čekanju · ${guests.declined} odbilo`}
        progress={percent(guests.confirmed, guests.total)}
        progressLabel={`${percent(guests.confirmed, guests.total)}% potvrđenih dolazaka`}
      />

      <StatCard
        label="Budžet"
        icon={Wallet}
        tone={overBudget ? "warning" : "accent"}
        value={formatCurrency(budget.agreed)}
        description={
          overBudget
            ? `Prekoračenje plana za ${formatCurrency(budget.agreed - budgetReference)}`
            : `Planirano ${formatCurrency(budgetReference)} · plaćeno ${formatCurrency(budget.paid)}`
        }
        progress={budgetUsage}
        progressLabel={`${budgetUsage}% plana ugovoreno · preostalo za uplatu ${formatCurrency(budget.remaining)}`}
      />

      <StatCard
        label="Zadaci"
        icon={ListChecks}
        tone={tasks.overdue > 0 ? "warning" : "success"}
        value={`${tasks.completed} / ${tasks.total}`}
        description={
          tasks.overdue > 0
            ? `${tasks.remaining} preostalo · ${tasks.overdue} kasni`
            : `${tasks.remaining} preostalo · nijedan ne kasni`
        }
        progress={percent(tasks.completed, tasks.total)}
        progressLabel={`${percent(tasks.completed, tasks.total)}% zadataka završeno`}
      />

      <StatCard
        label="Raspored sedenja"
        icon={Armchair}
        tone="neutral"
        value={`${seating.assigned} / ${seating.capacity}`}
        description={`${seating.tables} stolova · ${seating.unassigned} gostiju bez mesta`}
        progress={percent(seating.assigned, seating.capacity)}
        progressLabel={`${percent(seating.assigned, seating.capacity)}% kapaciteta popunjeno`}
      />
    </div>
  );
}
