import type { Metadata } from "next";

import { BudgetUI } from "@/components/budget/budget-ui";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { getBudgetItems, getVendors, getWedding } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Budžet",
  description: "Planirani i stvarni troškovi svadbe, plaćanja i rokovi.",
};

export default async function BudgetPage() {
  const wedding = await getWedding();

  if (!wedding) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="space-y-2 py-4">
            <CardTitle>Nema podataka o svadbi</CardTitle>
            <CardDescription>
              Kreirajte svadbu u podešavanjima da biste počeli sa planiranjem
              budžeta.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [items, vendors] = await Promise.all([
    getBudgetItems(wedding.id),
    getVendors(wedding.id),
  ]);

  return (
    <div className="p-6 sm:p-8">
      <BudgetUI
        initialItems={items}
        vendors={vendors}
        weddingId={wedding.id}
        plannedBudget={Number(wedding.planned_budget)}
      />
    </div>
  );
}
