/** Fiksni kurs za budžet: 1 € = 118 RSD. */
export const EUR_TO_RSD = 118;

export type BudgetCurrency = "eur" | "rsd";

export const BUDGET_CURRENCIES: readonly BudgetCurrency[] = ["eur", "rsd"];

export const BUDGET_CURRENCY_LABELS: Record<BudgetCurrency, string> = {
  eur: "Evro (€)",
  rsd: "Dinar (RSD)",
};

export function isBudgetCurrency(value: string): value is BudgetCurrency {
  return value === "eur" || value === "rsd";
}

/** Pretvara iznos iz valute unosa u kanonske dinare za čuvanje u bazi. */
export function toRsd(amount: number, currency: BudgetCurrency): number {
  if (!Number.isFinite(amount)) return 0;
  const rsd = currency === "eur" ? amount * EUR_TO_RSD : amount;
  return Math.round(rsd * 100) / 100;
}

/** Pretvara kanonske dinare nazad u valutu unosa (za formu). */
export function fromRsd(amountRsd: number, currency: BudgetCurrency): number {
  if (!Number.isFinite(amountRsd)) return 0;
  const value = currency === "eur" ? amountRsd / EUR_TO_RSD : amountRsd;
  return Math.round(value * 100) / 100;
}

export function rsdToEur(amountRsd: number): number {
  if (!Number.isFinite(amountRsd)) return 0;
  return Math.round((amountRsd / EUR_TO_RSD) * 100) / 100;
}

const eurFormatter = new Intl.NumberFormat("sr-RS", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const rsdFormatter = new Intl.NumberFormat("sr-RS", {
  style: "currency",
  currency: "RSD",
  maximumFractionDigits: 0,
});

const eurCompact = new Intl.NumberFormat("sr-RS", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Prikaz uvek u evrima i dinarima. `value` je u RSD. */
export function formatDualMoney(amountRsd: number): string {
  const rsd = Number.isFinite(amountRsd) ? amountRsd : 0;
  return `${eurFormatter.format(rsdToEur(rsd))} · ${rsdFormatter.format(Math.round(rsd))}`;
}

/** Kraći prikaz za ose grafikona — u evrima, jer su brojevi u dinarima preveliki. */
export function formatCompactEurFromRsd(amountRsd: number): string {
  return eurCompact.format(rsdToEur(amountRsd));
}

export function formatEurFromRsd(amountRsd: number): string {
  return eurFormatter.format(rsdToEur(amountRsd));
}

export function formatRsd(amountRsd: number): string {
  return rsdFormatter.format(Math.round(amountRsd));
}
