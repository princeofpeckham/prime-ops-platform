// Pure shift type and time helpers for the brand host views. No Supabase, no React.

import type { Badge } from "@/components/ui/Badge";
import type { ComponentProps } from "react";
import type { ShiftType } from "./types";

type BadgeTone = ComponentProps<typeof Badge>["tone"];

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

// Time strings arrive as "HH:MM:SS"; show "HH:MM".
export function shortTime(time: string): string {
  return time.slice(0, 5);
}

// Sort by date, then start time, so a list of shifts reads as a schedule.
export function sortBySchedule<T extends { date: string; startTime: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
  });
}
