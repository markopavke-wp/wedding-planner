import type { Metadata } from "next";
import Link from "next/link";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { UpcomingPanel } from "@/components/dashboard/upcoming-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardStats, getUpcomingTasks } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Kontrolna tabla",
  description:
    "Pregled priprema za svadbu: gosti, budžet, zadaci i raspored sedenja.",
};

function EmptyDashboard() {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <h1 className="font-display text-3xl font-semibold">
            Još nema podataka o svadbi
          </h1>
          <p className="text-sm text-muted">
            Unesite osnovne podatke o svadbi kako bismo pripremili kontrolnu
            tablu sa statistikom gostiju, budžeta i zadataka.
          </p>
          <Button asChild>
            <Link href="/settings">Podesi svadbu</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return <EmptyDashboard />;
  }

  const upcomingTasks = await getUpcomingTasks(stats.wedding.id, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:space-y-8 sm:p-8">
      <DashboardHero
        wedding={stats.wedding}
        confirmedGuests={stats.guests.confirmed}
        totalGuests={stats.guests.total}
      />

      <KpiGrid stats={stats} />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <ProgressOverview stats={stats} />
        <UpcomingPanel tasks={upcomingTasks} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardCharts stats={stats} />
      </div>
    </div>
  );
}
