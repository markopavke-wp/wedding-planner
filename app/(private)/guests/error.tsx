"use client";

import { CircleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GuestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[guests] Greška pri prikazu liste gostiju", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="size-7" aria-hidden />
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Lista gostiju se ne može učitati
          </h2>
          <p className="text-sm text-muted-foreground">
            Došlo je do greške pri učitavanju gostiju. Pokušajte ponovo za
            nekoliko trenutaka.
          </p>
        </div>
        <Button onClick={reset}>Pokušaj ponovo</Button>
      </CardContent>
    </Card>
  );
}
