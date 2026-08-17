"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
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

export default function PrivateError({
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
    <div className="flex flex-1 items-center justify-center py-10">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader>
          <span className="grid size-10 place-items-center rounded-xl bg-destructive/12 text-destructive">
            <TriangleAlert className="size-5" />
          </span>
          <CardTitle>Nešto je pošlo naopako</CardTitle>
          <CardDescription>
            Nismo mogli da prikažemo ovu stranicu. Probaj ponovo — ako se
            ponovi, osveži stranicu ili se vrati na kontrolnu tablu.
          </CardDescription>
        </CardHeader>

        {error.digest ? (
          <CardContent>
            <p className="rounded-lg bg-secondary px-3 py-2 font-mono text-xs text-muted-foreground">
              Kod greške: {error.digest}
            </p>
          </CardContent>
        ) : null}

        <CardFooter className="flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={() => retry()} className="w-full">
            <RotateCcw />
            Probaj ponovo
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="w-full">
              Kontrolna tabla
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
