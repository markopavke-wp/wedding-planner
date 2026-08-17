"use client";

import { CalendarDays, ListChecks, Loader, Pencil, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

import { CategoryBadge, PriorityBadge, StatusBadge, StatusIcon } from "./task-badges";
import { assigneeLabel, deadlineLabel, isOverdue } from "./utils";

interface TaskListProps {
  tasks: Task[];
  assigneeNames: Map<string, string>;
  today: string;
  pendingTaskIds: string[];
  isFiltered: boolean;
  onCreate: () => void;
  onResetFilters: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TaskList({
  tasks,
  assigneeNames,
  today,
  pendingTaskIds,
  isFiltered,
  onCreate,
  onResetFilters,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <ListChecks className="mx-auto mb-3 h-8 w-8 text-muted" aria-hidden="true" />
        {isFiltered ? (
          <>
            <p className="text-muted">Nijedan zadatak ne odgovara zadatim filterima.</p>
            <Button variant="outline" className="mt-4" onClick={onResetFilters}>
              Poništi filtere
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted">
              Još nema zadataka. Dodajte prvi i počnite da pratite napredak priprema.
            </p>
            <Button className="mt-4" onClick={onCreate}>
              Dodaj prvi zadatak
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const overdue = isOverdue(task, today);
        const hint = deadlineLabel(task, today);
        const assignee = assigneeLabel(task, assigneeNames);
        const isPending = pendingTaskIds.includes(task.id);
        const isCompleted = task.status === "completed";

        return (
          <li
            key={task.id}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition sm:flex-row sm:items-center",
              overdue && "border-red-200 dark:border-red-900/60",
              isPending && "opacity-60",
            )}
          >
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-lg text-left transition hover:opacity-80 disabled:cursor-not-allowed"
              aria-label={
                isCompleted
                  ? `Vrati zadatak u obradu: ${task.title}`
                  : `Označi zadatak kao završen: ${task.title}`
              }
              title={isCompleted ? "Vrati u obradu" : "Označi kao završeno"}
              disabled={isPending}
              onClick={() => onStatusChange(task, isCompleted ? "todo" : "completed")}
            >
              {isPending ? (
                <Loader className="h-5 w-5 animate-spin text-muted" aria-hidden="true" />
              ) : (
                <StatusIcon status={task.status} />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "font-medium",
                    isCompleted && "text-muted line-through",
                  )}
                >
                  {task.title}
                </p>
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                {task.category ? <CategoryBadge category={task.category} /> : null}
              </div>

              {task.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {task.description}
                </p>
              ) : null}

              {assignee ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  {assignee}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 sm:w-44">
              <p
                className={cn(
                  "flex items-center gap-1.5 text-sm text-muted",
                  overdue && "font-medium text-red-600 dark:text-red-400",
                )}
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {task.deadline ? formatDate(task.deadline) : "Bez roka"}
              </p>
              {hint ? (
                <p
                  className={cn(
                    "mt-0.5 text-xs text-muted",
                    overdue && "font-medium text-red-600 dark:text-red-400",
                  )}
                >
                  {hint}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Izmeni zadatak: ${task.title}`}
                title="Izmeni"
                disabled={isPending}
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Obriši zadatak: ${task.title}`}
                title="Obriši"
                disabled={isPending}
                onClick={() => onDelete(task)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
