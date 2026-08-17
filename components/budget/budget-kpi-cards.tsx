import type { ComponentType } from "react";
import { Banknote, PiggyBank, Receipt, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { formatMoney, formatPercentValue, itemCountLabel } from "./format";
import type { BudgetSummary } from "./types";

type Tone = "rose" | "gold" | "sage" | "slate";

const TONE_CLASSES: Record<Tone, string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  sage: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

interface KpiCardProps {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  tone: Tone;
  progress?: number;
  danger?: boolean;
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone,
  progress,
  danger,
}: KpiCardProps) {
  return (
    <Card className="h-full gap-0 py-0">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {title}
            </p>
            <p
              className={cn(
                "font-display text-3xl font-semibold leading-none",
                danger && "text-red-600 dark:text-red-400",
              )}
            >
              {value}
            </p>
          </div>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              TONE_CLASSES[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>

        <p
          className={cn(
            "text-sm text-muted",
            danger && "text-red-600 dark:text-red-400",
          )}
        >
          {hint}
        </p>

        {typeof progress === "number" ? (
          <div className="mt-auto">
            <Progress value={progress} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface BudgetKpiCardsProps {
  summary: BudgetSummary;
  plannedBudget: number;
}

export function BudgetKpiCards({ summary, plannedBudget }: BudgetKpiCardsProps) {
  const usage = plannedBudget > 0 ? (summary.planned / plannedBudget) * 100 : 0;
  const available = plannedBudget - summary.planned;
  const difference = summary.actual - summary.planned;
  const paidProgress =
    summary.planned > 0 ? Math.min((summary.paid / summary.planned) * 100, 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Ukupan budžet"
        value={formatMoney(plannedBudget)}
        hint={
          plannedBudget <= 0
            ? "Unesite planirani budžet u podešavanjima svadbe."
            : available < 0
              ? `Prekoračenje plana za ${formatMoney(Math.abs(available))}`
              : `Slobodno u budžetu: ${formatMoney(available)}`
        }
        icon={Wallet}
        tone="rose"
        progress={plannedBudget > 0 ? usage : undefined}
        danger={available < 0}
      />

      <KpiCard
        title="Planirano"
        value={formatMoney(summary.planned)}
        hint={
          summary.itemCount === 0
            ? "Još nema unetih stavki budžeta."
            : `${itemCountLabel(summary.itemCount)} · ${formatPercentValue(usage)} budžeta`
        }
        icon={Receipt}
        tone="slate"
      />

      <KpiCard
        title="Stvarni trošak"
        value={formatMoney(summary.actual)}
        hint={
          summary.actual === 0
            ? "Unesite stvarne troškove da uporedite sa planom."
            : difference > 0
              ? `${formatMoney(difference)} više od plana`
              : difference < 0
                ? `${formatMoney(Math.abs(difference))} manje od plana`
                : "Poklapa se sa planom"
        }
        icon={Banknote}
        tone="gold"
        danger={difference > 0}
      />

      <KpiCard
        title="Plaćeno"
        value={formatMoney(summary.paid)}
        hint={`Kapare: ${formatMoney(summary.deposit)} · Preostalo: ${formatMoney(summary.remaining)}`}
        icon={PiggyBank}
        tone="sage"
        progress={paidProgress}
      />
    </div>
  );
}
