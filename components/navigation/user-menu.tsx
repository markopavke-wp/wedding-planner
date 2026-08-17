"use client";

import { ChevronDown, LoaderCircle, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/supabase/auth-actions";
import { cn } from "@/lib/utils";
import {
  getUserDisplayName,
  getUserInitials,
  type SessionUser,
} from "./types";

type UserMenuProps = {
  user: SessionUser;
  collapsed?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
};

function UserMenu({
  user,
  collapsed = false,
  align = "start",
  className,
}: UserMenuProps) {
  const [pending, startTransition] = useTransition();
  const displayName = getUserDisplayName(user);

  function handleSignOut() {
    startTransition(async () => {
      try {
        await signOut();
      } catch {
        toast.error("Odjava nije uspela. Probaj ponovo.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors outline-none",
          "hover:bg-sidebar-accent/70 focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/35",
          "data-[state=open]:bg-sidebar-accent/70",
          collapsed && "justify-center",
          className,
        )}
      >
        <Avatar className="size-8">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
        {collapsed ? (
          <span className="sr-only">Korisnički meni — {displayName}</span>
        ) : (
          <>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-medium">
                {displayName}
              </span>
              {user.email ? (
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              ) : null}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="min-w-56">
        <div className="flex flex-col gap-0.5 px-2 py-2">
          <span className="truncate text-sm font-medium">{displayName}</span>
          {user.email ? (
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Podešavanja
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            handleSignOut();
          }}
        >
          {pending ? <LoaderCircle className="animate-spin" /> : <LogOut />}
          {pending ? "Odjavljivanje…" : "Odjavi se"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
