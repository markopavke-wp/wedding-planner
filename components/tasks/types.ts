import type { Task, TaskStatus } from "@/types/database";

export type TaskView = "list" | "kanban";

export type TaskSortKey = "deadline" | "priority" | "title" | "created_at";

export interface TaskFilters {
  search: string;
  /** `TaskStatus` ili `all`. */
  status: string;
  /** `TaskPriority` ili `all`. */
  priority: string;
  /** Id profila, `unassigned` ili `all`. */
  assignee: string;
  onlyOverdue: boolean;
  sort: TaskSortKey;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  completionRate: number;
}

export type TasksByStatus = Record<TaskStatus, Task[]>;
