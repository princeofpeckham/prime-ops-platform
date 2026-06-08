// Pure shift status and type helpers. No Supabase, no React, so it is unit-testable.

import type { Badge } from "@/components/ui/Badge";
import type { ComponentProps } from "react";
import type { ShiftItem, ShiftStatus, ShiftType } from "./types";

type BadgeTone = ComponentProps<typeof Badge>["tone"];

export const STATUS_ORDER: readonly ShiftStatus[] = [
  "open",
  "applied",
  "assigned",
  "completed",
  "cancelled"
] as const;

export const STATUS_LABEL: Record<ShiftStatus, string> = {
  open: "Open",
  applied: "Applied",
  assigned: "Assigned",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const STATUS_TONE: Record<ShiftStatus, BadgeTone> = {
  open: "warn",
  applied: "accent",
  assigned: "good",
  completed: "muted",
  cancelled: "neutral"
};

export const TYPE_LABEL: Record<ShiftType, string> = {
  check_in: "Check in",
  check_out: "Check out",
  viewing: "Viewing"
};

export const TYPE_TONE: Record<ShiftType, BadgeTone> = {
  check_in: "good",
  check_out: "accent",
  viewing: "neutral"
};

// Time strings arrive as "HH:MM:SS"; show "HH:MM" in Europe/London context.
export function shortTime(time: string): string {
  return time.slice(0, 5);
}

// Sort by date, then start time, so the table reads as a schedule.
export function sortShifts(items: ShiftItem[]): ShiftItem[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
  });
}
