import { Circle, CircleCheck, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types/database";

import {
  TASK_PRIORITY_BADGE_CLASSES,
  TASK_PRIORITY_SHORT_LABELS,
  TASK_STATUS_BADGE_CLASSES,
  TASK_STATUS_LABELS,
} from "./constants";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge className={TASK_PRIORITY_BADGE_CLASSES[priority]}>
      {TASK_PRIORITY_SHORT_LABELS[priority]}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge className={TASK_STATUS_BADGE_CLASSES[status]}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}

export function StatusIcon({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  if (status === "completed") {
    return (
      <CircleCheck
        className={cn("h-5 w-5 text-emerald-600 dark:text-emerald-400", className)}
        aria-hidden="true"
      />
    );
  }

  if (status === "in_progress") {
    return (
      <Clock
        className={cn("h-5 w-5 text-amber-600 dark:text-amber-400", className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <Circle className={cn("h-5 w-5 text-muted", className)} aria-hidden="true" />
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge className="bg-secondary text-secondary-foreground">{category}</Badge>
  );
}
