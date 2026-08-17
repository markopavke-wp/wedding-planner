"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { Task } from "@/types/database";

import { TaskCard } from "./task-card";

interface TaskBoardCardProps {
  task: Task;
  assignee: string | null;
  today: string;
  isPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskBoardCard({
  task,
  assignee,
  today,
  isPending,
  onEdit,
  onDelete,
}: TaskBoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isPending,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={isDragging ? "opacity-40" : undefined}
    >
      <TaskCard
        task={task}
        assignee={assignee}
        today={today}
        isPending={isPending}
        onEdit={onEdit}
        onDelete={onDelete}
        handle={
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none rounded-md p-0.5 text-muted transition hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed"
            aria-label={`Premesti zadatak: ${task.title}`}
            disabled={isPending}
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      />
    </div>
  );
}
