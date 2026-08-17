"use client";

import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({ open, onOpenChange, title, children, className }: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);

    // Bez zaključavanja se pozadina skroluje ispod otvorenog dijaloga na dodir.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          // Na telefonu je dijalog list sa dna, na većim ekranima centrirana kartica.
          // `dvh` prati adresnu traku, pa dugačke forme ne ispadnu van ekrana.
          "card-premium flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-b-none",
          "sm:max-h-[calc(100dvh-2rem)] sm:rounded-b-[1.25rem]",
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h2
            id={titleId}
            className="font-display text-xl font-semibold sm:text-2xl"
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zatvori"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
