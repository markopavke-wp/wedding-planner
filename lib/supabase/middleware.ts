import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

export type SessionUpdate = {
  /** Response carrying any refreshed auth cookies. */
  response: NextResponse;
  user: User | null;
};

/**
 * Refreshes the Supabase session for an incoming request and returns the
 * response that carries the rotated auth cookies. Must run before any other
 * response is produced, otherwise refreshed tokens are lost.
 */
export async function updateSession(
  request: NextRequest,
): Promise<SessionUpdate> {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }

        for (const [header, headerValue] of Object.entries(headers)) {
          response.headers.set(header, headerValue);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  return { response, user: data.user ?? null };
}
