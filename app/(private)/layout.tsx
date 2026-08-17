import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/navigation/app-shell";
import { SIDEBAR_COLLAPSED_COOKIE } from "@/components/navigation/sidebar-preference";
import type { SessionUser } from "@/components/navigation/types";
import { LOGIN_PATH } from "@/lib/routes";
import { getCurrentUser } from "@/lib/supabase/server";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(LOGIN_PATH);
  }

  const metadata: Record<string, unknown> = user.user_metadata ?? {};
  const sessionUser: SessionUser = {
    email: user.email ?? null,
    fullName:
      readMetadataString(metadata, "full_name") ??
      readMetadataString(metadata, "name"),
    avatarUrl: readMetadataString(metadata, "avatar_url"),
  };

  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "true";

  return (
    <AppShell user={sessionUser} defaultCollapsed={defaultCollapsed}>
      {children}
    </AppShell>
  );
}
