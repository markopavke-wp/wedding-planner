"use client";

import { Check, Loader, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types/database";

import { PriorityBadge } from "./task-badges";
import { assigneeLabel, deadlineLabel } from "./utils";

interface OverdueTasksProps {
  tasks: Task[];
  assigneeNames: Map<string, string>;
  today: string;
  pendingTaskIds: string[];
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
}

export function OverdueTasks({
  tasks,
  assigneeNames,
  today,
  pendingTaskIds,
  onEdit,
  onComplete,
}: OverdueTasksProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          Zakasneli zadaci ({tasks.length})
        </CardTitle>
        <CardDescription className="text-red-600 dark:text-red-300/80">
          Ovim zadacima je prošao rok. Rešite ih ili pomerite rok da biste
          zadržali plan.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => {
          const isPending = pendingTaskIds.includes(task.id);
          const assignee = assigneeLabel(task, assigneeNames);

          return (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-card p-4 dark:border-red-900/60"
            >
              <div className="min-w-0">
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Rok: {formatDate(task.deadline)}
                  {deadlineLabel(task, today) ? ` · ${deadlineLabel(task, today)}` : ""}
                </p>
                {assignee ? (
                  <p className="mt-1 text-xs text-muted">{assignee}</p>
                ) : null}
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <PriorityBadge priority={task.priority} />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => onEdit(task)}
                  >
                    Izmeni
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => onComplete(task)}
                  >
                    {isPending ? (
                      <Loader className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Check className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Završi
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
