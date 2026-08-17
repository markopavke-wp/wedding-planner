"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  isNavItemActive,
  navSections,
  secondaryNavItems,
  type NavItem,
} from "./nav-items";

type NavLinksProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/35",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 h-5 w-0.5 rounded-full bg-sidebar-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <item.icon
        className={cn(
          "size-4.5 shrink-0 transition-colors",
          active ? "text-sidebar-primary" : "text-current",
        )}
        strokeWidth={active ? 2.25 : 2}
      />
      {collapsed ? (
        <span className="sr-only">{item.label}</span>
      ) : (
        <span className="truncate">{item.label}</span>
      )}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function NavLinks({ collapsed = false, onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Glavna navigacija" className="flex flex-col gap-6">
      {navSections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          {collapsed ? (
            <span className="sr-only">{section.title}</span>
          ) : (
            <span className="px-3 pb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {section.title}
            </span>
          )}
          {section.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isNavItemActive(pathname, item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-4">
        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isNavItemActive(pathname, item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

export { NavLinks };
