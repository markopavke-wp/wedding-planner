import { CalendarClock, CircleCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types/database";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "Visok",
  medium: "Srednji",
  low: "Nizak",
};

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-secondary text-secondary-foreground",
};

export function UpcomingPanel({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1.5">
          <CardTitle className="font-display text-2xl">Naredni koraci</CardTitle>
          <CardDescription>Zadaci kojima uskoro ističe rok.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/tasks">Svi zadaci</Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-10 text-center">
            <CircleCheck className="size-6 text-success" aria-hidden />
            <p className="text-sm text-muted">
              Nema zadataka sa rokom u narednom periodu.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <CalendarClock className="size-3.5" aria-hidden />
                  {formatDate(task.deadline)}
                  {task.category ? ` · ${task.category}` : ""}
                </p>
              </div>
              <Badge className={cn("shrink-0", PRIORITY_CLASSES[task.priority])}>
                {PRIORITY_LABELS[task.priority]}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
