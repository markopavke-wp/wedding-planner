export const LOGIN_PATH = "/login";
export const DEFAULT_PRIVATE_PATH = "/dashboard";

/** Route prefixes reachable without a session. Everything else is private. */
export const PUBLIC_PATH_PREFIXES = [LOGIN_PATH, "/auth"] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Rejects absolute and protocol-relative URLs so `redirectTo` cannot become an open redirect. */
export function resolveRedirectTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_PRIVATE_PATH;
  }

  if (isPublicPath(value)) {
    return DEFAULT_PRIVATE_PATH;
  }

  return value;
}
