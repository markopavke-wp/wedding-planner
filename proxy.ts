import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_PRIVATE_PATH, LOGIN_PATH, isPublicPath } from "@/lib/routes";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Moves the refreshed auth cookies from the session response onto a redirect,
 * otherwise a rotated token would be dropped on every guarded navigation.
 */
function redirectWithSessionCookies(
  destination: URL,
  sessionResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(destination);

  for (const cookie of sessionResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  redirectResponse.headers.set("Cache-Control", "private, no-store");

  return redirectResponse;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const isPublic = isPublicPath(pathname);

  if (!user && !isPublic) {
    const loginUrl = new URL(LOGIN_PATH, request.url);

    if (pathname !== "/") {
      loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    }

    return redirectWithSessionCookies(loginUrl, response);
  }

  if (user && (pathname === "/" || pathname === LOGIN_PATH)) {
    return redirectWithSessionCookies(
      new URL(DEFAULT_PRIVATE_PATH, request.url),
      response,
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Runs on every route except build output and static assets, so both pages
     * and their RSC/data requests are guarded.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf)$).*)",
  ],
};
