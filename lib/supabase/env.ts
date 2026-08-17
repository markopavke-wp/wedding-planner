export type SupabaseEnv = {
  url: string;
  key: string;
};

const MISSING_ENV_MESSAGE =
  "Supabase nije konfigurisan. Podesi NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY (ili NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) u .env.local.";

/**
 * Reads the public Supabase credentials. The values must be referenced as
 * literal `process.env.*` properties so the bundler can inline them into the
 * browser bundle.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(MISSING_ENV_MESSAGE);
  }

  return { url, key };
}
