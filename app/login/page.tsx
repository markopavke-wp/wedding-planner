import { Heart, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolveRedirectTo } from "@/lib/routes";
import { getCurrentUser } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Prijava",
  description: "Prijavi se na svoj svadbeni planer.",
};

const highlights = [
  "Spisak gostiju sa potvrdama dolaska",
  "Budžet sa realnim troškovima",
  "Zadaci i vremenska linija do velikog dana",
];

function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestedPath = readSearchParam(params.redirectTo);
  const user = await getCurrentUser();

  if (user) {
    redirect(resolveRedirectTo(requestedPath));
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <section className="surface-gradient relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Heart className="size-5" strokeWidth={2.25} />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Svadbeni planer
          </span>
        </div>

        <div className="flex max-w-md flex-col gap-6">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-balance">
            Svaki detalj vašeg dana, mirno i pod kontrolom.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Jedno mesto za goste, budžet, zadatke i saradnike — bez tabela koje
            se gube po telefonima.
          </p>
          <ul className="flex flex-col gap-3">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 text-sm text-secondary-foreground"
              >
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Pristup je privatan i vezan isključivo za vaš nalog.
        </p>
      </section>

      <section className="surface-gradient flex items-center justify-center p-6 sm:p-10 lg:bg-none">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Heart className="size-5" strokeWidth={2.25} />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Svadbeni planer
            </span>
          </div>

          <Card className="border-border/80 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-2xl">Dobro došli nazad</CardTitle>
              <CardDescription>
                Prijavi se email adresom i šifrom da nastaviš planiranje.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm redirectTo={requestedPath} />
            </CardContent>
          </Card>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Nemaš pristup? Naloge dodaje organizator u Supabase kontrolnoj
            tabli.
          </p>
        </div>
      </section>
    </div>
  );
}
