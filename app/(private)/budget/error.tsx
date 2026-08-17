"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BudgetError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 sm:p-8">
      <Card className="mx-auto w-full max-w-md shadow-elevated">
        <CardHeader>
          <span className="grid size-10 place-items-center rounded-xl bg-destructive/12 text-destructive">
            <TriangleAlert className="size-5" />
          </span>
          <CardTitle>Budžet nije mogao da se učita</CardTitle>
          <CardDescription>
            Došlo je do greške pri čitanju stavki budžeta. Probajte ponovo — ako
            se greška ponavlja, osvežite stranicu.
          </CardDescription>
        </CardHeader>

        {error.digest ? (
          <CardContent>
            <p className="rounded-lg bg-secondary px-3 py-2 font-mono text-xs text-muted">
              Kod greške: {error.digest}
            </p>
          </CardContent>
        ) : null}

        <CardFooter>
          <Button type="button" onClick={() => retry()} className="w-full">
            <RotateCcw className="mr-2 size-4" />
            Probaj ponovo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
