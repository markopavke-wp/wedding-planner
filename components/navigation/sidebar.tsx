"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import type { SessionUser } from "./types";
import { UserMenu } from "./user-menu";

type SidebarProps = {
  user: SessionUser;
  collapsed: boolean;
  onToggle: () => void;
};

function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex",
        "transition-[width] duration-300 ease-out motion-reduce:transition-none",
        collapsed ? "w-[4.75rem]" : "w-72",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-4",
        )}
      >
        <Brand showWordmark={!collapsed} />
        {collapsed ? null : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Skupi navigaciju"
            title="Skupi navigaciju"
            className="text-muted-foreground hover:text-foreground"
            onClick={onToggle}
          >
            <PanelLeft className="size-4" />
          </Button>
        )}
      </div>

      {collapsed ? (
        <div className="flex justify-center pt-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Raširi navigaciju"
            title="Raširi navigaciju"
            className="text-muted-foreground hover:text-foreground"
            onClick={onToggle}
          >
            <PanelLeft className="size-4 rotate-180" />
          </Button>
        </div>
      ) : null}

      <div className="scrollbar-slim flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <NavLinks collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3",
          collapsed && "items-center",
        )}
      >
        <UserMenu user={user} collapsed={collapsed} align="start" />
        {collapsed ? (
          <ThemeToggle />
        ) : (
          <div className="flex items-center justify-between gap-2 px-2">
            <span className="text-xs text-muted-foreground">Izgled</span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  );
}

export { Sidebar };
