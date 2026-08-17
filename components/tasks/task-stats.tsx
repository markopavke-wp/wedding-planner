import type { ComponentType } from "react";
import { CircleCheck, Clock, ListChecks, TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { TaskStats as TaskStatsData } from "./types";

interface StatProps {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  tone: "rose" | "gold" | "sage" | "red";
  progress?: number;
}

const TONE_CLASSES: Record<StatProps["tone"], string> = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  sage: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

function Stat({ title, value, hint, icon: Icon, tone, progress }: StatProps) {
  return (
    <Card className="h-full gap-0 py-0">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {title}
            </p>
            <p className="font-display text-3xl font-semibold leading-none">{value}</p>
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
        <p className="text-sm text-muted">{hint}</p>
        {typeof progress === "number" ? (
          <div className="mt-auto">
            <Progress value={progress} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function TaskStats({ stats }: { stats: TaskStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        title="Ukupno zadataka"
        value={String(stats.total)}
        hint={`Za uraditi: ${stats.todo}`}
        icon={ListChecks}
        tone="rose"
      />
      <Stat
        title="U toku"
        value={String(stats.inProgress)}
        hint={
          stats.dueSoon > 0
            ? `${stats.dueSoon} sa rokom u sledećih 7 dana`
            : "Nema rokova u sledećih 7 dana"
        }
        icon={Clock}
        tone="gold"
      />
      <Stat
        title="Završeno"
        value={String(stats.completed)}
        hint={`${Math.round(stats.completionRate)}% svih zadataka je završeno`}
        icon={CircleCheck}
        tone="sage"
        progress={stats.completionRate}
      />
      <Stat
        title="Zakasnelo"
        value={String(stats.overdue)}
        hint={
          stats.overdue > 0
            ? "Rokovi su prošli — potrebna je pažnja."
            : "Svi rokovi su pod kontrolom."
        }
        icon={TriangleAlert}
        tone={stats.overdue > 0 ? "red" : "sage"}
      />
    </div>
  );
}
