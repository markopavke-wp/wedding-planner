"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { LOGIN_PATH, resolveRedirectTo } from "@/lib/routes";
import { createClient } from "./server";

export type SignInInput = {
  email: string;
  password: string;
  redirectTo?: string;
};

export type SignInResult = {
  error: string;
};

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Unesi email adresu.")
    .email("Unesi ispravnu email adresu."),
  password: z.string().min(1, "Unesi šifru."),
});

export async function signIn(input: SignInInput): Promise<SignInResult | null> {
  const parsed = signInSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Podaci nisu ispravni.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error:
        error.status === 400
          ? "Neispravna email adresa ili šifra."
          : "Prijava trenutno nije moguća. Probaj ponovo za nekoliko trenutaka.",
    };
  }

  redirect(resolveRedirectTo(input.redirectTo));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect(LOGIN_PATH);
}
