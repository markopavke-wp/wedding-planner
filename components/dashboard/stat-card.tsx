import type { ComponentType, ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  description?: ReactNode;
  progress?: number;
  progressLabel?: string;
  tone?: "accent" | "success" | "warning" | "neutral";
};

const TONE_CLASSES = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-secondary text-secondary-foreground",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  progress,
  progressLabel,
  tone = "accent",
}: StatCardProps) {
  return (
    <Card className="h-full gap-0 py-0">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {label}
            </p>
            <p className="font-display text-3xl font-semibold leading-none">
              {value}
            </p>
          </div>
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              TONE_CLASSES[tone],
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>

        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}

        {typeof progress === "number" ? (
          <div className="space-y-1.5">
            <Progress value={progress} />
            {progressLabel ? (
              <p className="text-xs text-muted">{progressLabel}</p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
