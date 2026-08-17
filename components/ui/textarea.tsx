import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 sm:text-sm",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
