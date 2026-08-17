const currencyFormatter = new Intl.NumberFormat("sr-RS", {
  style: "currency",
  currency: "RSD",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("sr-RS", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("sr-RS");

export function formatMoney(value: number): string {
  return currencyFormatter.format(Math.round(value));
}

export function formatCompactMoney(value: number): string {
  return compactFormatter.format(value);
}

export function formatPercentValue(value: number): string {
  return `${numberFormatter.format(Math.round(value))}%`;
}

export function formatDueDate(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Srpska pluralizacija (1 stavka, 2 stavke, 5 stavki). */
export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function itemCountLabel(count: number): string {
  return `${numberFormatter.format(count)} ${pluralize(count, "stavka", "stavke", "stavki")}`;
}
