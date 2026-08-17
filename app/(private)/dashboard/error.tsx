"use client";

import { CircleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] Greška pri prikazu kontrolne table", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="size-7" aria-hidden />
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Kontrolna tabla se ne može učitati
          </h2>
          <p className="text-sm text-muted-foreground">
            Došlo je do greške pri učitavanju podataka o venčanju. Pokušajte
            ponovo za nekoliko trenutaka.
          </p>
        </div>
        <Button onClick={reset}>Pokušaj ponovo</Button>
      </CardContent>
    </Card>
  );
}
