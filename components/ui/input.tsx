import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Safari na iOS zumira ekran kad je polje ispod 16px, pa je tek od `sm` sitniji tekst.
        "w-full min-w-0 rounded-xl border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none transition sm:text-sm",
        "placeholder:text-muted/70",
        "focus:border-accent focus:ring-4 focus:ring-accent/10",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/15",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
