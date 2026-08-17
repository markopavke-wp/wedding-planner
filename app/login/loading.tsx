import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="grid min-h-svh place-items-center p-6"
    >
      <span className="sr-only">Učitavanje prijave…</span>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Skeleton className="h-10 w-40" />
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-soft">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
