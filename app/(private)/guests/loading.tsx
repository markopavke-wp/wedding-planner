import { Skeleton } from "@/components/ui/skeleton";

const SUMMARY_KEYS = [
  "gosti",
  "potvrdjeni",
  "cekanje",
  "odbili",
  "pratioci",
  "stolovi",
] as const;

const ROW_KEYS = Array.from({ length: 8 }, (_, index) => `red-${index}`);

export default function GuestsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28 bg-border/70" />
          <Skeleton className="h-10 w-48 bg-border/70" />
          <Skeleton className="h-4 w-72 bg-border/70" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl bg-border/70" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {SUMMARY_KEYS.map((key) => (
          <Skeleton key={key} className="h-[74px] rounded-2xl bg-border/70" />
        ))}
      </div>

      <div className="card-premium space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-12">
          <Skeleton className="h-11 rounded-xl bg-border/70 lg:col-span-4" />
          <Skeleton className="h-11 rounded-xl bg-border/70 lg:col-span-2" />
          <Skeleton className="h-11 rounded-xl bg-border/70 lg:col-span-2" />
          <Skeleton className="h-11 rounded-xl bg-border/70 lg:col-span-2" />
          <Skeleton className="h-11 rounded-xl bg-border/70 lg:col-span-2" />
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-4 w-44 bg-border/70" />
          <Skeleton className="h-9 w-56 rounded-xl bg-border/70" />
        </div>
      </div>

      <div className="card-premium divide-y divide-border overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-4 bg-border/70" />
          <Skeleton className="h-3 w-24 bg-border/70" />
          <Skeleton className="ml-auto h-3 w-20 bg-border/70" />
        </div>
        {ROW_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-4 w-4 shrink-0 bg-border/70" />
            <Skeleton className="h-4 w-40 bg-border/70" />
            <Skeleton className="hidden h-6 w-20 rounded-full bg-border/70 sm:block" />
            <Skeleton className="hidden h-4 w-24 bg-border/70 lg:block" />
            <Skeleton className="hidden h-6 w-24 rounded-full bg-border/70 lg:block" />
            <Skeleton className="ml-auto h-8 w-20 bg-border/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
