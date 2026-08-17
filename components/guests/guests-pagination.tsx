"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export const PAGE_SIZES = [10, 25, 50, 100];

type GuestsPaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function GuestsPagination({
  page,
  pageCount,
  pageSize,
  totalCount,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
}: GuestsPaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted">
        {totalCount === 0
          ? "Nema rezultata"
          : `Prikazano ${rangeStart}–${rangeEnd} od ${totalCount}`}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Po strani</span>
          <Select
            className="h-9 w-20 py-0 text-sm"
            aria-label="Broj gostiju po strani"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Prethodna strana"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="text-sm tabular-nums">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Sledeća strana"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
