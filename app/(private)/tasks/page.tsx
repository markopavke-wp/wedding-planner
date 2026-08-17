import type { Metadata } from "next";

import { TasksUI } from "@/components/tasks/tasks-ui";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { getProfiles, getTasks, getWedding } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Zadaci",
  description: "Lista i Kanban tabla zadataka sa rokovima i zaduženjima.",
};

export default async function TasksPage() {
  const wedding = await getWedding();

  if (!wedding) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="space-y-2 py-4">
            <CardTitle>Nema podataka o svadbi</CardTitle>
            <CardDescription>
              Kreirajte svadbu u podešavanjima da biste dodavali zadatke.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [tasks, profiles] = await Promise.all([
    getTasks(wedding.id),
    getProfiles(),
  ]);

  return (
    <div className="p-6 sm:p-8">
      <TasksUI initialTasks={tasks} profiles={profiles} weddingId={wedding.id} />
    </div>
  );
}
