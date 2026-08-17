"use client";

import { useSyncExternalStore } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remainingFrom(target: number): Remaining | null {
  const diff = target - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
  };
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[64px] rounded-2xl border border-border/60 bg-card/70 px-3 py-2 text-center backdrop-blur sm:min-w-[78px] sm:px-4 sm:py-3">
      <div className="font-display text-2xl font-semibold tabular-nums sm:text-3xl">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </div>
    </div>
  );
}

/** Sekundni „tick“ kao eksterni store da bi SSR i klijent ostali usklađeni. */
function subscribeToTick(onTick: () => void) {
  const interval = window.setInterval(onTick, SECOND);
  return () => window.clearInterval(interval);
}

function getTick(): number {
  return Math.floor(Date.now() / SECOND);
}

function getServerTick(): null {
  return null;
}

export function Countdown({ weddingDate }: { weddingDate: string }) {
  const target = new Date(weddingDate).getTime();
  const tick = useSyncExternalStore(subscribeToTick, getTick, getServerTick);

  if (Number.isNaN(target)) return null;

  const mounted = tick !== null;
  const remaining = mounted ? remainingFrom(target) : null;

  if (mounted && !remaining) {
    return (
      <p className="text-sm font-medium text-foreground">
        Veliki dan je iza vas — čestitamo!
      </p>
    );
  }

  const pad = (value: number) => value.toString().padStart(2, "0");

  return (
    <div
      className="flex flex-wrap gap-2 sm:gap-3"
      aria-label="Odbrojavanje do svadbe"
    >
      <Cell value={remaining ? String(remaining.days) : "—"} label="dana" />
      <Cell value={remaining ? pad(remaining.hours) : "—"} label="sati" />
      <Cell value={remaining ? pad(remaining.minutes) : "—"} label="minuta" />
      <Cell value={remaining ? pad(remaining.seconds) : "—"} label="sekundi" />
    </div>
  );
}
