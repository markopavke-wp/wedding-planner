"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

import {
  TASK_STATUS_COLUMN_CLASSES,
  TASK_STATUS_HINTS,
  TASK_STATUS_LABELS,
} from "./constants";
import { TaskBoardCard } from "./task-board-card";

interface TaskBoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  assigneeNames: Map<string, string>;
  today: string;
  pendingTaskIds: string[];
  onAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskBoardColumn({
  status,
  tasks,
  assigneeNames,
  today,
  pendingTaskIds,
  onAdd,
  onEdit,
  onDelete,
}: TaskBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={TASK_STATUS_LABELS[status]}
      className={cn(
        "flex min-h-[320px] flex-col rounded-3xl border p-4 transition",
        TASK_STATUS_COLUMN_CLASSES[status],
        isOver && "border-accent ring-4 ring-accent/10",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-medium">
            {TASK_STATUS_LABELS[status]}{" "}
            <span className="text-muted">({tasks.length})</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted">{TASK_STATUS_HINTS[status]}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Dodaj zadatak u kolonu ${TASK_STATUS_LABELS[status]}`}
          title="Dodaj zadatak"
          onClick={() => onAdd(status)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-3">
        {tasks.map((task) => (
          <TaskBoardCard
            key={task.id}
            task={task}
            assignee={task.assigned_to ? assigneeNames.get(task.assigned_to) ?? null : null}
            today={today}
            isPending={pendingTaskIds.includes(task.id)}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
          />
        ))}

        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            {isOver ? "Otpustite da premestite zadatak" : "Prevucite zadatak ovde"}
          </p>
        ) : null}
      </div>
    </section>
  );
}
