import { CalendarHeart, MapPin, Users } from "lucide-react";

import { Countdown } from "@/components/dashboard/countdown";
import { daysUntil, formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/lib/queries";

type DashboardHeroProps = {
  wedding: DashboardStats["wedding"];
  confirmedGuests: number;
  totalGuests: number;
};

export function DashboardHero({
  wedding,
  confirmedGuests,
  totalGuests,
}: DashboardHeroProps) {
  const countdown = daysUntil(wedding.wedding_date);
  const location = [wedding.venue, wedding.city].filter(Boolean).join(", ");

  return (
    <section className="card-premium overflow-hidden rounded-3xl">
      <div className="surface-gradient bg-[linear-gradient(135deg,var(--accent-soft),var(--card))] px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Vaša svadba
            </p>

            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {wedding.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <CalendarHeart className="size-4 text-accent" aria-hidden />
                {formatDate(wedding.wedding_date)}
              </span>

              {location ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-accent" aria-hidden />
                  {location}
                </span>
              ) : null}

              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-accent" aria-hidden />
                {confirmedGuests} od {totalGuests} gostiju potvrdilo
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {countdown !== null && countdown >= 0
                ? "Preostalo do velikog dana"
                : "Odbrojavanje"}
            </p>
            <Countdown weddingDate={wedding.wedding_date} />
          </div>
        </div>
      </div>
    </section>
  );
}
