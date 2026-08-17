export type SessionUser = {
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

export function getUserDisplayName(user: SessionUser): string {
  return user.fullName ?? user.email ?? "Korisnik";
}

export function getUserInitials(user: SessionUser): string {
  const source = user.fullName ?? user.email ?? "";
  const parts = source
    .replace(/[@.].*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "SP";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}
