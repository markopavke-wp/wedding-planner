import type { Profile, Task, TaskStatus } from "@/types/database";

import {
  ALL_FILTER,
  TASK_PRIORITY_WEIGHT,
  TASK_STATUS_ORDER,
  UNASSIGNED_FILTER,
} from "./constants";
import type { TaskFilters, TaskStats, TasksByStatus } from "./types";

export const DUE_SOON_DAYS = 7;

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUS_ORDER as string[]).includes(value);
}

export function isOverdue(task: Task, today: string): boolean {
  return (
    task.status !== "completed" && task.deadline !== null && task.deadline < today
  );
}

export function daysFromToday(deadline: string, today: string): number {
  const diff =
    new Date(`${deadline}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime();
  return Math.round(diff / 86_400_000);
}

/** Kratak opis roka: „Kasni 3 dana”, „Danas”, „Za 5 dana”. */
export function deadlineLabel(task: Task, today: string): string | null {
  if (!task.deadline) return null;

  const days = daysFromToday(task.deadline, today);

  if (task.status === "completed") return null;
  if (days < -1) return `Kasni ${Math.abs(days)} dana`;
  if (days === -1) return "Kasni 1 dan";
  if (days === 0) return "Rok je danas";
  if (days === 1) return "Rok je sutra";
  if (days <= DUE_SOON_DAYS) return `Za ${days} dana`;
  return null;
}

export function assigneeNames(profiles: Profile[]): Map<string, string> {
  return new Map(
    profiles.map((profile) => [
      profile.id,
      profile.full_name?.trim() || profile.email?.trim() || "Član tima",
    ]),
  );
}

export function assigneeLabel(
  task: Task,
  names: Map<string, string>,
): string | null {
  if (!task.assigned_to) return null;
  return names.get(task.assigned_to) ?? "Član tima";
}

export function computeStats(tasks: Task[], today: string): TaskStats {
  const stats = tasks.reduce<TaskStats>(
    (current, task) => {
      current.total += 1;

      if (task.status === "todo") current.todo += 1;
      if (task.status === "in_progress") current.inProgress += 1;
      if (task.status === "completed") current.completed += 1;
      if (isOverdue(task, today)) current.overdue += 1;

      if (
        task.status !== "completed" &&
        task.deadline !== null &&
        task.deadline >= today &&
        daysFromToday(task.deadline, today) <= DUE_SOON_DAYS
      ) {
        current.dueSoon += 1;
      }

      return current;
    },
    {
      total: 0,
      todo: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      dueSoon: 0,
      completionRate: 0,
    },
  );

  stats.completionRate =
    stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return stats;
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  names: Map<string, string>,
  today: string,
): Task[] {
  const query = filters.search.trim().toLocaleLowerCase("sr-RS");

  return tasks.filter((task) => {
    if (filters.status !== ALL_FILTER && task.status !== filters.status) {
      return false;
    }

    if (filters.priority !== ALL_FILTER && task.priority !== filters.priority) {
      return false;
    }

    if (filters.assignee === UNASSIGNED_FILTER && task.assigned_to !== null) {
      return false;
    }

    if (
      filters.assignee !== ALL_FILTER &&
      filters.assignee !== UNASSIGNED_FILTER &&
      task.assigned_to !== filters.assignee
    ) {
      return false;
    }

    if (filters.onlyOverdue && !isOverdue(task, today)) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    const haystack = [
      task.title,
      task.description,
      task.category,
      assigneeLabel(task, names),
    ]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLocaleLowerCase("sr-RS");

    return haystack.includes(query);
  });
}

export function sortTasks(tasks: Task[], sort: TaskFilters["sort"]): Task[] {
  return [...tasks].sort((left, right) => {
    switch (sort) {
      case "deadline": {
        const a = left.deadline ?? "9999-12-31";
        const b = right.deadline ?? "9999-12-31";
        return a.localeCompare(b);
      }
      case "priority":
        return (
          TASK_PRIORITY_WEIGHT[left.priority] - TASK_PRIORITY_WEIGHT[right.priority]
        );
      case "title":
        return left.title.localeCompare(right.title, "sr-RS");
      case "created_at":
        return right.created_at.localeCompare(left.created_at);
    }
  });
}

export function groupByStatus(tasks: Task[]): TasksByStatus {
  const grouped: TasksByStatus = {
    todo: [],
    in_progress: [],
    completed: [],
  };

  for (const task of tasks) {
    grouped[task.status].push(task);
  }

  return grouped;
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.status !== ALL_FILTER ||
    filters.priority !== ALL_FILTER ||
    filters.assignee !== ALL_FILTER ||
    filters.onlyOverdue
  );
}

export const emptyTaskFilters: TaskFilters = {
  search: "",
  status: ALL_FILTER,
  priority: ALL_FILTER,
  assignee: ALL_FILTER,
  onlyOverdue: false,
  sort: "deadline",
};
