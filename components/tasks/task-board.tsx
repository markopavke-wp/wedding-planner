"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import { useState } from "react";

import type { Task, TaskStatus } from "@/types/database";

import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "./constants";
import { TaskBoardColumn } from "./task-board-column";
import { TaskCard } from "./task-card";
import type { TasksByStatus } from "./types";
import { isTaskStatus } from "./utils";

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "Pritisnite razmak ili enter da podignete zadatak, strelicama izaberite kolonu, pa ponovo pritisnite razmak da ga premestite. Escape otkazuje premeštanje.",
};

interface TaskBoardProps {
  tasks: Task[];
  tasksByStatus: TasksByStatus;
  assigneeNames: Map<string, string>;
  today: string;
  pendingTaskIds: string[];
  onAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TaskBoard({
  tasks,
  tasksByStatus,
  assigneeNames,
  today,
  pendingTaskIds,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskBoardProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const findTask = (id: string | number): Task | undefined =>
    tasks.find((task) => task.id === String(id));

  const activeTask = activeTaskId ? findTask(activeTaskId) : undefined;

  const announcements: Announcements = {
    onDragStart({ active }) {
      const task = findTask(active.id);
      return task ? `Podignut zadatak ${task.title}.` : undefined;
    },
    onDragOver({ active, over }) {
      const task = findTask(active.id);
      if (!task || !over || !isTaskStatus(String(over.id))) return undefined;
      return `Zadatak ${task.title} je nad kolonom ${TASK_STATUS_LABELS[String(over.id) as TaskStatus]}.`;
    },
    onDragEnd({ active, over }) {
      const task = findTask(active.id);
      if (!task) return undefined;
      if (!over || !isTaskStatus(String(over.id))) {
        return `Zadatak ${task.title} je vraćen na početnu poziciju.`;
      }
      return `Zadatak ${task.title} je premešten u kolonu ${TASK_STATUS_LABELS[String(over.id) as TaskStatus]}.`;
    },
    onDragCancel({ active }) {
      const task = findTask(active.id);
      return task
        ? `Premeštanje zadatka ${task.title} je otkazano.`
        : "Premeštanje je otkazano.";
    },
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null);

    const overId = event.over?.id;
    if (overId === undefined) return;

    const status = String(overId);
    if (!isTaskStatus(status)) return;

    const task = findTask(event.active.id);
    if (!task || task.status === status) return;

    onStatusChange(task, status);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTaskId(null)}
    >
      <div className="grid gap-5 xl:grid-cols-3">
        {TASK_STATUS_ORDER.map((status) => (
          <TaskBoardColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            assigneeNames={assigneeNames}
            today={today}
            pendingTaskIds={pendingTaskIds}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-[min(22rem,80vw)] cursor-grabbing">
            <TaskCard
              task={activeTask}
              assignee={
                activeTask.assigned_to
                  ? assigneeNames.get(activeTask.assigned_to) ?? null
                  : null
              }
              today={today}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
