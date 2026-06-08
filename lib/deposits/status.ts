// Pure deposit status + deadline logic. No Supabase, no React, so it is unit-testable.

import { londonToday } from "@/lib/utils";
import type { DepositItem, DepositStatus } from "./types";

// Mirrors the tone union accepted by the shared Badge component.
type BadgeTone = "neutral" | "accent" | "good" | "warn" | "alert" | "muted";

export const STATUS_ORDER: readonly DepositStatus[] = [
  "pending_review",
  "deduction_proposed",
  "approved",
  "processed",
  "auto_refunded"
] as const;

export const STATUS_LABEL: Record<DepositStatus, string> = {
  pending_review: "Pending review",
  deduction_proposed: "Deduction proposed",
  approved: "Approved",
  processed: "Processed",
  auto_refunded: "Auto refunded"
};

export const STATUS_TONE: Record<DepositStatus, BadgeTone> = {
  pending_review: "warn",
  deduction_proposed: "accent",
  approved: "good",
  processed: "muted",
  auto_refunded: "neutral"
};

// A deposit is settled once it has been processed or auto refunded.
const CLOSED: readonly DepositStatus[] = ["processed", "auto_refunded"] as const;

export function isClosed(status: DepositStatus): boolean {
  return CLOSED.includes(status);
}

// Whole days from today (Europe/London) to the deadline. Negative means overdue.
export function daysToDeadline(deadlineIso: string, now: Date = new Date()): number {
  const today = londonToday(now);
  const toUtc = (iso: string): number => {
    const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
  };
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((toUtc(deadlineIso) - toUtc(today)) / msPerDay);
}

// True when an open deposit is due within 3 days or already overdue.
export function isDueSoon(item: Pick<DepositItem, "status" | "deadlineDate">, now: Date = new Date()): boolean {
  if (isClosed(item.status)) return false;
  return daysToDeadline(item.deadlineDate, now) <= 3;
}

// Human label for the countdown, e.g. "in 5 days", "due today", "2 days overdue".
export function countdownLabel(days: number): string {
  if (days < 0) {
    const n = Math.abs(days);
    return n === 1 ? "1 day overdue" : `${n} days overdue`;
  }
  if (days === 0) return "due today";
  if (days === 1) return "in 1 day";
  return `in ${days} days`;
}

// Sort open deposits (most urgent deadline first), then settled ones after.
export function sortByUrgency(items: DepositItem[]): DepositItem[] {
  return [...items].sort((a, b) => {
    const aClosed = isClosed(a.status);
    const bClosed = isClosed(b.status);
    if (aClosed !== bClosed) return aClosed ? 1 : -1;
    return a.deadlineDate.localeCompare(b.deadlineDate);
  });
}
