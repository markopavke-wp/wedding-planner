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
  AXIS_TICK,
  CHART_COLORS,
  CHART_SERIES,
  GRID_STROKE,
  INVITATION_COLORS,
} from "@/components/dashboard/chart-palette";
import {
  CountTooltip,
  CurrencyTooltip,
} from "@/components/dashboard/chart-tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description: string;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
};

function ChartCard({
  title,
  description,
  isEmpty,
  emptyMessage,
  children,
}: ChartCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-display text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border">
            <p className="max-w-[30ch] text-center text-sm text-muted">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

function legendLabel(value: ReactNode) {
  return <span className="text-xs text-muted">{value}</span>;
}

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const invitationData = stats.guestStatusChart;
  const invitationTotal = invitationData.reduce(
    (sum, entry) => sum + entry.value,
    0,
  );
  const invitationColors = [
    INVITATION_COLORS.confirmed,
    INVITATION_COLORS.pending,
    INVITATION_COLORS.declined,
  ];

  const sideTotal = stats.sideChart.reduce((sum, entry) => sum + entry.value, 0);
  const budgetTotal = stats.budgetByCategory.reduce(
    (sum, entry) => sum + entry.value,
    0,
  );
  const taskTotal = stats.taskProgress.reduce(
    (sum, entry) => sum + entry.value,
    0,
  );

  const budgetData = [...stats.budgetByCategory].sort(
    (a, b) => b.value - a.value,
  );

  return (
    <>
      <ChartCard
        title="Status pozivnica"
        description="Odnos potvrđenih, neodgovorenih i odbijenih pozivnica."
        isEmpty={invitationTotal === 0}
        emptyMessage="Dodajte goste da biste pratili odgovore na pozivnice."
      >
        <div className="relative h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={invitationData}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={94}
                paddingAngle={2}
                strokeWidth={0}
              >
                {invitationData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={invitationColors[index % invitationColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={CountTooltip} />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                formatter={legendLabel}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-x-0 top-[76px] flex flex-col items-center">
            <span className="font-display text-3xl font-semibold tabular-nums">
              {invitationTotal}
            </span>
            <span className="text-xs text-muted">ukupno gostiju</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard
        title="Grupe gostiju"
        description="Raspodela po mladencima i njihovim roditeljima, uključujući pratioce i decu."
        isEmpty={sideTotal === 0}
        emptyMessage="Dodajte goste da biste videli odnos strana."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats.sideChart}
            layout="vertical"
            margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke={GRID_STROKE}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={138}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
            />
            <Tooltip content={CountTooltip} cursor={{ fillOpacity: 0.06 }} />
            <Bar
              dataKey="value"
              name="Gostiju"
              radius={[0, 10, 10, 0]}
              maxBarSize={44}
            >
              {stats.sideChart.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={CHART_SERIES[index % CHART_SERIES.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Budžet po kategorijama"
        description={`Planirana ulaganja po kategorijama · ukupno ${formatCurrency(budgetTotal)}.`}
        isEmpty={budgetData.length === 0}
        emptyMessage="Unesite stavke budžeta da biste videli raspodelu troškova."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={budgetData}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke={GRID_STROKE}
            />
            <XAxis
              dataKey="category"
              interval={0}
              height={52}
              angle={-18}
              textAnchor="end"
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
            />
            <YAxis
              width={78}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              tickFormatter={(value: number) => formatCurrency(value)}
            />
            <Tooltip content={CurrencyTooltip} cursor={{ fillOpacity: 0.06 }} />
            <Bar
              dataKey="value"
              name="Planirano"
              radius={[10, 10, 0, 0]}
              maxBarSize={46}
            >
              {budgetData.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={CHART_SERIES[index % CHART_SERIES.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Napredak zadataka"
        description="Odnos završenih i preostalih obaveza do svadbe."
        isEmpty={taskTotal === 0}
        emptyMessage="Kreirajte zadatke da biste pratili napredak priprema."
      >
        <div className="relative h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.taskProgress}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={94}
                paddingAngle={2}
                strokeWidth={0}
              >
                {stats.taskProgress.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={index === 0 ? CHART_COLORS.success : CHART_COLORS.stoneLight}
                  />
                ))}
              </Pie>
              <Tooltip content={CountTooltip} />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                formatter={legendLabel}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-x-0 top-[76px] flex flex-col items-center">
            <span className="font-display text-3xl font-semibold tabular-nums">
              {stats.tasks.total > 0
                ? `${Math.round((stats.tasks.completed / stats.tasks.total) * 100)}%`
                : "0%"}
            </span>
            <span className="text-xs text-muted">završeno</span>
          </div>
        </div>
      </ChartCard>
    </>
  );
}
