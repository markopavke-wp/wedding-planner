import { Skeleton } from "@/components/ui/skeleton";

export default function VendorsLoading() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-12" />
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-64" />
        ))}
      </div>
    </div>
  );
}
