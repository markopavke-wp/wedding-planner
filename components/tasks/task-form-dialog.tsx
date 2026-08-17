"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Profile, Task, TaskStatus } from "@/types/database";

import {
  TASK_CATEGORY_SUGGESTIONS,
  TASK_PRIORITY_ORDER,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from "./constants";
import {
  taskFormDefaults,
  taskFormSchema,
  toTaskPayload,
  type TaskFormValues,
  type TaskPayload,
} from "./schema";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  /** Status koji se predlaže kada se zadatak dodaje iz kanban kolone. */
  initialStatus: TaskStatus;
  profiles: Profile[];
  onSubmit: (payload: TaskPayload) => Promise<boolean>;
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  wide,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? "",
    category: task.category ?? "",
    deadline: task.deadline ?? "",
    priority: task.priority,
    status: task.status,
    assigned_to: task.assigned_to ?? "",
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  initialStatus,
  profiles,
  onSubmit,
}: TaskFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskFormDefaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      task ? taskToFormValues(task) : { ...taskFormDefaults, status: initialStatus },
    );
  }, [initialStatus, open, reset, task]);

  const submit = handleSubmit(async (values) => {
    const saved = await onSubmit(toTaskPayload(values));
    if (saved) {
      onOpenChange(false);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Izmeni zadatak" : "Novi zadatak"}
      className="max-w-2xl"
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field
          label="Naslov *"
          htmlFor="task-title"
          error={errors.title?.message}
          wide
        >
          <Input
            id="task-title"
            autoFocus
            placeholder="npr. Rezervisati salu za probnu večeru"
            {...register("title")}
          />
        </Field>

        <Field
          label="Kategorija"
          htmlFor="task-category"
          error={errors.category?.message}
          hint="Predlozi se pojavljuju pri unosu."
        >
          <Input
            id="task-category"
            list="task-category-suggestions"
            placeholder="npr. Ceremonija"
            {...register("category")}
          />
          <datalist id="task-category-suggestions">
            {TASK_CATEGORY_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </Field>

        <Field label="Rok" htmlFor="task-deadline" error={errors.deadline?.message}>
          <Input id="task-deadline" type="date" {...register("deadline")} />
        </Field>

        <Field
          label="Prioritet"
          htmlFor="task-priority"
          error={errors.priority?.message}
        >
          <Select id="task-priority" {...register("priority")}>
            {TASK_PRIORITY_ORDER.map((priority) => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status" htmlFor="task-status" error={errors.status?.message}>
          <Select id="task-status" {...register("status")}>
            {TASK_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Zadužena osoba"
          htmlFor="task-assignee"
          error={errors.assigned_to?.message}
          hint={profiles.length === 0 ? "Još nema članova tima." : undefined}
        >
          <Select id="task-assignee" {...register("assigned_to")}>
            <option value="">Nije dodeljeno</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name || profile.email || "Član tima"}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Opis"
          htmlFor="task-description"
          error={errors.description?.message}
          wide
        >
          <Textarea
            id="task-description"
            placeholder="Detalji, kontakti, sledeći koraci..."
            {...register("description")}
          />
        </Field>

        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Otkaži
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Čuvanje..." : "Sačuvaj"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
