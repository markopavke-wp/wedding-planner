"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Brand } from "./brand";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import type { SessionUser } from "./types";
import { UserMenu } from "./user-menu";

function MobileNav({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Otvori navigaciju"
          >
            <Menu className="size-4.5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="gap-0 p-0">
          <SheetHeader className="border-b border-sidebar-border pb-4">
            <SheetTitle className="sr-only">Navigacija</SheetTitle>
            <SheetDescription className="sr-only">
              Navigacija kroz sekcije svadbenog planera
            </SheetDescription>
            <Brand />
          </SheetHeader>

          <div className="scrollbar-slim flex flex-1 flex-col overflow-y-auto px-3 pb-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-sidebar-border p-3">
            <UserMenu user={user} className="flex-1" />
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>

      <Brand showWordmark={false} className="ml-1" />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserMenu user={user} collapsed align="end" className="w-auto" />
      </div>
    </header>
  );
}

export { MobileNav };
