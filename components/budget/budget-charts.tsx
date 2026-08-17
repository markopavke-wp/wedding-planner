"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ACTUAL_SERIES_COLOR,
  CHART_TOOLTIP_STYLE,
  PAID_SERIES_COLOR,
  PLANNED_SERIES_COLOR,
  REMAINING_SERIES_COLOR,
} from "./constants";
import { formatCompactMoney, formatMoney, formatPercentValue } from "./format";
import type { BudgetSummary, CategoryDatum } from "./types";

interface ChartShellProps {
  title: string;
  description: string;
  isEmpty: boolean;
  emptyMessage: string;
  className?: string;
  children: ReactNode;
}

function ChartShell({
  title,
  description,
  isEmpty,
  emptyMessage,
  className,
  children,
}: ChartShellProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-border">
            <p className="max-w-[30ch] text-center text-sm text-muted">
              {emptyMessage}
            </p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function DonutCenter({ label, value }: { label: string; value: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="font-display text-2xl font-semibold">{value}</span>
    </div>
  );
}

interface LegendRow {
  key: string;
  label: string;
  color: string;
  value: number;
  share: number;
}

function ChartLegend({ rows }: { rows: LegendRow[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
              aria-hidden="true"
            />
            <span className="truncate">{row.label}</span>
          </span>
          <span className="shrink-0 text-muted">
            {formatMoney(row.value)} · {formatPercentValue(row.share)}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface BudgetChartsProps {
  categories: CategoryDatum[];
  summary: BudgetSummary;
}

export function BudgetCharts({ categories, summary }: BudgetChartsProps) {
  const plannedCategories = categories.filter((category) => category.planned > 0);
  const paymentData = [
    { key: "paid", label: "Plaćeno", value: summary.paid, color: PAID_SERIES_COLOR },
    {
      key: "remaining",
      label: "Preostalo",
      value: summary.remaining,
      color: REMAINING_SERIES_COLOR,
    },
  ].filter((entry) => entry.value > 0);
  const paymentTotal = summary.paid + summary.remaining;
  const comparisonHeight = Math.max(280, categories.length * 46);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartShell
        title="Raspodela planiranog budžeta"
        description="Udeo pojedinačnih kategorija u ukupnom planu."
        isEmpty={plannedCategories.length === 0}
        emptyMessage="Dodajte stavke sa planiranim iznosom da biste videli raspodelu."
      >
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={plannedCategories}
                dataKey="planned"
                nameKey="label"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {plannedCategories.map((category) => (
                  <Cell key={category.key} fill={category.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMoney(Number(value))}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
          <DonutCenter label="Planirano" value={formatMoney(summary.planned)} />
        </div>
        <ChartLegend
          rows={plannedCategories.map((category) => ({
            key: category.key,
            label: category.label,
            color: category.color,
            value: category.planned,
            share:
              summary.planned > 0 ? (category.planned / summary.planned) * 100 : 0,
          }))}
        />
      </ChartShell>

      <ChartShell
        title="Plaćeno i preostalo"
        description="Odnos izmirenih i neizmirenih obaveza po stavkama."
        isEmpty={paymentData.length === 0}
        emptyMessage="Kada unesete iznose i plaćanja, ovde ćete videti napredak izmirenja."
      >
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={paymentData}
                dataKey="value"
                nameKey="label"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {paymentData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMoney(Number(value))}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
          <DonutCenter
            label="Izmireno"
            value={
              paymentTotal > 0
                ? formatPercentValue((summary.paid / paymentTotal) * 100)
                : "0%"
            }
          />
        </div>
        <ChartLegend
          rows={paymentData.map((entry) => ({
            key: entry.key,
            label: entry.label,
            color: entry.color,
            value: entry.value,
            share: paymentTotal > 0 ? (entry.value / paymentTotal) * 100 : 0,
          }))}
        />
      </ChartShell>

      <ChartShell
        className="xl:col-span-2"
        title="Planirano i stvarno po kategoriji"
        description="Poređenje plana i stvarnih troškova pomaže da uočite odstupanja."
        isEmpty={categories.length === 0}
        emptyMessage="Dodajte stavke budžeta da biste uporedili plan i stvarne troškove."
      >
        <ResponsiveContainer width="100%" height={comparisonHeight}>
          <BarChart
            data={categories}
            layout="vertical"
            margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            barGap={4}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="var(--border)"
            />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCompactMoney(Number(value))}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-muted"
            />
            <YAxis
              type="category"
              dataKey="label"
              width={150}
              tickLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-muted"
            />
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Legend />
            <Bar
              dataKey="planned"
              name="Planirano"
              fill={PLANNED_SERIES_COLOR}
              radius={[0, 6, 6, 0]}
            />
            <Bar
              dataKey="actual"
              name="Stvarno"
              fill={ACTUAL_SERIES_COLOR}
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  );
}
