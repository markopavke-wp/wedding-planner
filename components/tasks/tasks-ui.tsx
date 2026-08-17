"use client";

import { List, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs } from "@/components/ui/tabs";
import { createTask, deleteTask, updateTask } from "@/lib/actions/task";
import type { Profile, Task, TaskStatus } from "@/types/database";

import { ALL_FILTER, TASK_STATUS_LABELS } from "./constants";
import { OverdueTasks } from "./overdue-tasks";
import type { TaskPayload } from "./schema";
import { TaskBoard } from "./task-board";
import { TaskFilters } from "./task-filters";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskList } from "./task-list";
import { TaskStats } from "./task-stats";
import type { TaskView } from "./types";
import {
  assigneeNames as buildAssigneeNames,
  computeStats,
  emptyTaskFilters,
  filterTasks,
  groupByStatus,
  hasActiveFilters,
  isOverdue,
  sortTasks,
  todayISO,
} from "./utils";

interface TasksUIProps {
  initialTasks: Task[];
  profiles: Profile[];
  weddingId: string;
}

export function TasksUI({ initialTasks, profiles, weddingId }: TasksUIProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<TaskView>("list");
  const [filters, setFilters] = useState(emptyTaskFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("todo");
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<string[]>([]);

  const today = useMemo(() => todayISO(), []);
  const names = useMemo(() => buildAssigneeNames(profiles), [profiles]);
  const stats = useMemo(() => computeStats(tasks, today), [tasks, today]);
  const overdueTasks = useMemo(
    () =>
      sortTasks(
        tasks.filter((task) => isOverdue(task, today)),
        "deadline",
      ),
    [tasks, today],
  );
  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, filters, names, today), filters.sort),
    [filters, names, tasks, today],
  );
  const tasksByStatus = useMemo(() => groupByStatus(visibleTasks), [visibleTasks]);
  const filtersActive = hasActiveFilters(filters);

  function markPending(taskId: string, pending: boolean) {
    setPendingTaskIds((current) =>
      pending
        ? [...current, taskId]
        : current.filter((pendingId) => pendingId !== taskId),
    );
  }

  // Kanban kolone već predstavljaju statuse, pa filter po statusu tamo nema smisla.
  function changeView(next: TaskView) {
    setView(next);
    if (next === "kanban") {
      setFilters((current) => ({ ...current, status: ALL_FILTER }));
    }
  }

  function openCreate(status: TaskStatus = "todo") {
    setEditing(null);
    setInitialStatus(status);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleSubmit(payload: TaskPayload): Promise<boolean> {
    const toastId = toast.loading(
      editing ? "Čuvanje izmena..." : "Dodavanje zadatka...",
    );

    const result = editing
      ? await updateTask({ ...payload, id: editing.id, wedding_id: weddingId })
      : await createTask({ ...payload, wedding_id: weddingId });

    if (!result.success) {
      toast.error("Zadatak nije sačuvan.", {
        id: toastId,
        description: result.error,
      });
      return false;
    }

    const saved = result.data;
    setTasks((current) =>
      editing
        ? current.map((task) => (task.id === saved.id ? saved : task))
        : [saved, ...current],
    );
    toast.success(editing ? "Zadatak je izmenjen." : "Zadatak je dodat.", {
      id: toastId,
    });
    return true;
  }

  async function handleDelete() {
    if (!deleting) return;

    setIsDeleting(true);
    const toastId = toast.loading("Brisanje zadatka...");
    const result = await deleteTask(weddingId, deleting.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error("Zadatak nije obrisan.", {
        id: toastId,
        description: result.error,
      });
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== deleting.id));
    setDeleting(null);
    toast.success("Zadatak je obrisan.", { id: toastId });
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    if (task.status === status) return;

    const previousStatus = task.status;

    // Optimistično premeštanje da bi kanban ostao responzivan tokom čuvanja.
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status } : item)),
    );
    markPending(task.id, true);

    const result = await updateTask({
      id: task.id,
      wedding_id: weddingId,
      status,
    });

    markPending(task.id, false);

    if (!result.success) {
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, status: previousStatus } : item,
        ),
      );
      toast.error("Status zadatka nije promenjen.", { description: result.error });
      return;
    }

    const saved = result.data;
    setTasks((current) =>
      current.map((item) => (item.id === saved.id ? saved : item)),
    );
    toast.success(`„${saved.title}” → ${TASK_STATUS_LABELS[status]}`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Organizacija
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold">Zadaci</h1>
          <p className="mt-2 text-sm text-muted">
            Pratite obaveze, rokove i napredak priprema za venčanje.
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Novi zadatak
        </Button>
      </header>

      <TaskStats stats={stats} />

      <OverdueTasks
        tasks={overdueTasks}
        assigneeNames={names}
        today={today}
        pendingTaskIds={pendingTaskIds}
        onEdit={openEdit}
        onComplete={(task) => void handleStatusChange(task, "completed")}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { id: "list", label: "Lista" },
            { id: "kanban", label: "Kanban" },
          ]}
          active={view}
          onChange={(id) => changeView(id === "kanban" ? "kanban" : "list")}
        />
        <p className="text-sm text-muted">
          {filtersActive
            ? `Prikazano ${visibleTasks.length} od ${tasks.length} zadataka.`
            : "Prevlačenjem u Kanban prikazu menjate status zadatka."}
        </p>
      </div>

      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters(emptyTaskFilters)}
        showReset={filtersActive}
        showStatusFilter={view === "list"}
        profiles={profiles}
        overdueCount={stats.overdue}
      />

      {view === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" aria-hidden="true" />
              Svi zadaci
            </CardTitle>
            <CardDescription>
              Označite zadatak kao završen jednim klikom na ikonicu statusa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList
              tasks={visibleTasks}
              assigneeNames={names}
              today={today}
              pendingTaskIds={pendingTaskIds}
              isFiltered={filtersActive}
              onCreate={() => openCreate()}
              onResetFilters={() => setFilters(emptyTaskFilters)}
              onEdit={openEdit}
              onDelete={setDeleting}
              onStatusChange={(task, status) => void handleStatusChange(task, status)}
            />
          </CardContent>
        </Card>
      ) : (
        <TaskBoard
          tasks={visibleTasks}
          tasksByStatus={tasksByStatus}
          assigneeNames={names}
          today={today}
          pendingTaskIds={pendingTaskIds}
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={setDeleting}
          onStatusChange={(task, status) => void handleStatusChange(task, status)}
        />
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        initialStatus={initialStatus}
        profiles={profiles}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(value) => {
          if (!value) setDeleting(null);
        }}
        title="Obriši zadatak?"
        description={
          deleting ? `Zadatak „${deleting.title}” biće trajno obrisan.` : ""
        }
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
