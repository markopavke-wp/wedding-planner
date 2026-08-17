"use client";

import { useCallback, useState, type ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { SIDEBAR_COLLAPSED_COOKIE } from "./sidebar-preference";
import { Sidebar } from "./sidebar";
import type { SessionUser } from "./types";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function AppShell({
  user,
  defaultCollapsed = false,
  children,
}: {
  user: SessionUser;
  defaultCollapsed?: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      // Persisted in a cookie so the server can render the right width on the
      // first paint instead of flashing the expanded sidebar.
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
      return next;
    });
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-background">
        <Sidebar user={user} collapsed={collapsed} onToggle={toggleCollapsed} />

        <div
          className={cn(
            "flex min-h-svh flex-col transition-[padding] duration-300 ease-out motion-reduce:transition-none",
            collapsed ? "lg:pl-[4.75rem]" : "lg:pl-72",
          )}
        >
          <MobileNav user={user} />
          <main className="surface-gradient flex flex-1 flex-col">
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export { AppShell };
