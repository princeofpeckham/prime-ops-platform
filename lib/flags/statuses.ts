// Pure flag-status logic. No Supabase, no React, so it is easy to reason about.

import type { FlagColumn, FlagItem, FlagSeverity, FlagStatus } from "./types";

export const STATUS_ORDER: readonly FlagStatus[] = [
  "raised",
  "triaged",
  "assigned",
  "in_progress",
  "resolved",
  "dismissed"
] as const;

export const STATUS_LABEL: Record<FlagStatus, string> = {
  raised: "Raised",
  triaged: "Triaged",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  dismissed: "Dismissed"
};

// Tailwind border-top accent per column, so the board reads at a glance.
export const STATUS_ACCENT: Record<FlagStatus, string> = {
  raised: "border-t-red-400",
  triaged: "border-t-amber-400",
  assigned: "border-t-blue-400",
  in_progress: "border-t-violet-400",
  resolved: "border-t-emerald-400",
  dismissed: "border-t-neutral-300"
};

// Severity drives the chip tone on each card.
export const SEVERITY_TONE: Record<FlagSeverity, "muted" | "neutral" | "warn" | "alert"> = {
  low: "muted",
  medium: "neutral",
  high: "warn",
  urgent: "alert"
};

export const SEVERITY_LABEL: Record<FlagSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent"
};

// A flag is "open" until it is resolved or dismissed.
export function isOpen(status: FlagStatus): boolean {
  return status !== "resolved" && status !== "dismissed";
}

// Group a flat list of flags into ordered columns by status.
export function toColumns(items: FlagItem[]): FlagColumn[] {
  return STATUS_ORDER.map((status) => ({
    status,
    items: items.filter((it) => it.status === status)
  }));
}
