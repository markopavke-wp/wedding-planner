"use client";

import type { ReactNode } from "react";
import { CalendarDays, Loader, Pencil, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { Task } from "@/types/database";

import { CategoryBadge, PriorityBadge } from "./task-badges";
import { deadlineLabel, isOverdue } from "./utils";

interface TaskCardProps {
  task: Task;
  assignee: string | null;
  today: string;
  handle?: ReactNode;
  isPending?: boolean;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskCard({
  task,
  assignee,
  today,
  handle,
  isPending = false,
  isDragging = false,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const overdue = isOverdue(task, today);
  const hint = deadlineLabel(task, today);

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-soft transition",
        overdue && "border-red-200 dark:border-red-900/60",
        isDragging && "rotate-1 shadow-elevated",
        isPending && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2">
        {handle}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-medium leading-snug",
              task.status === "completed" && "text-muted line-through",
            )}
          >
            {task.title}
          </p>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{task.description}</p>
          ) : null}
        </div>
        {isPending ? (
          <Loader className="h-4 w-4 shrink-0 animate-spin text-muted" aria-label="Čuvanje" />
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.category ? <CategoryBadge category={task.category} /> : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0 space-y-1 text-xs text-muted">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className={cn(overdue && "font-medium text-red-600 dark:text-red-400")}>
              {task.deadline ? formatDate(task.deadline) : "Bez roka"}
            </span>
          </p>
          {hint ? (
            <p className={cn(overdue && "font-medium text-red-600 dark:text-red-400")}>
              {hint}
            </p>
          ) : null}
          {assignee ? (
            <p className="flex items-center gap-1.5 truncate">
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{assignee}</span>
            </p>
          ) : null}
        </div>

        {onEdit || onDelete ? (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Izmeni zadatak: ${task.title}`}
                title="Izmeni"
                disabled={isPending}
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Obriši zadatak: ${task.title}`}
                title="Obriši"
                disabled={isPending}
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
