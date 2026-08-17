import { Skeleton } from "@/components/ui/skeleton";

export default function NotesLoading() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-44" />
        ))}
      </div>
    </div>
  );
}
