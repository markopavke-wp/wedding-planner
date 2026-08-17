import { Heart } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

function Brand({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/dashboard"
      aria-label="Svadbeni planer — kontrolna tabla"
      className={cn(
        "group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-[1.03]">
        <Heart className="size-4.5" strokeWidth={2.25} />
      </span>
      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold tracking-tight">
            Svadbeni planer
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Sve na jednom mestu
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export { Brand };
