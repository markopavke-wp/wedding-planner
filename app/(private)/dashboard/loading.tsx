import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KPI_KEYS = ["gosti", "budzet", "zadaci", "raspored"] as const;
const CHART_KEYS = ["pozivnice", "strane", "budzet", "zadaci"] as const;
const PROGRESS_KEYS = ["prvi", "drugi", "treci", "cetvrti", "peti"] as const;

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:space-y-8 sm:p-8">
      <Skeleton className="h-56 rounded-3xl bg-border/70 sm:h-64" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_KEYS.map((key) => (
          <Card key={key} className="gap-0 py-0">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-border/70" />
                  <Skeleton className="h-8 w-24 bg-border/70" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl bg-border/70" />
              </div>
              <Skeleton className="h-4 w-full bg-border/70" />
              <Skeleton className="h-2 w-full rounded-full bg-border/70" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-56 bg-border/70" />
            <Skeleton className="h-4 w-72 bg-border/70" />
          </CardHeader>
          <CardContent className="space-y-5">
            {PROGRESS_KEYS.map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-40 bg-border/70" />
                  <Skeleton className="h-3 w-28 bg-border/70" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-border/70" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-32 bg-border/70" />
            <Skeleton className="h-4 w-48 bg-border/70" />
          </CardHeader>
          <CardContent className="space-y-3">
            {["prvi", "drugi", "treci"].map((key) => (
              <Skeleton key={key} className="h-16 rounded-2xl bg-border/70" />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {CHART_KEYS.map((key) => (
          <Card key={key}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48 bg-border/70" />
              <Skeleton className="h-4 w-64 bg-border/70" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-2xl bg-border/70" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
