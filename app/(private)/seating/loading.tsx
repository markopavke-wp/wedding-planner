import { Skeleton } from "@/components/ui/skeleton";

export default function SeatingLoading() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <Skeleton className="h-[640px]" />
        <Skeleton className="h-[640px]" />
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-72" />
        </div>
      </div>
    </div>
  );
}
