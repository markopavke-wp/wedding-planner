"use client";

import type { TooltipContentProps } from "recharts";

import { formatCurrency } from "@/lib/utils";

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function createTooltip(formatValue: (value: number) => string) {
  return function ChartTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="card-premium min-w-40 px-3 py-2 text-sm shadow-elevated">
        {label ? (
          <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
        ) : null}
        <ul className="space-y-1">
          {payload.map((entry, index) => (
            <li
              key={`${String(entry.dataKey ?? entry.name ?? index)}`}
              className="flex items-center gap-2"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: entry.color ?? entry.fill }}
              />
              <span className="text-muted">{entry.name}</span>
              <span className="ml-auto font-medium tabular-nums">
                {formatValue(toNumber(entry.value))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
}

export const CountTooltip = createTooltip((value) =>
  new Intl.NumberFormat("sr-RS").format(value),
);

export const CurrencyTooltip = createTooltip(formatCurrency);
