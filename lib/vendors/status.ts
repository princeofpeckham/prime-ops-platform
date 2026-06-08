// Pure pipeline-status and trade logic. No Supabase, no React, so it is unit-testable.

import type { TradeType, VendorJobItem, VendorJobStatus, VendorJobColumn } from "./types";

export const STATUS_ORDER: readonly VendorJobStatus[] = [
  "draft",
  "quoted",
  "approved",
  "scheduled",
  "in_progress",
  "completed",
  "disputed"
] as const;

export const STATUS_LABEL: Record<VendorJobStatus, string> = {
  draft: "Draft",
  quoted: "Quoted",
  approved: "Approved",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  disputed: "Disputed"
};

// Tailwind border-top accent per column, so the pipeline reads at a glance.
export const STATUS_ACCENT: Record<VendorJobStatus, string> = {
  draft: "border-t-neutral-400",
  quoted: "border-t-blue-400",
  approved: "border-t-violet-400",
  scheduled: "border-t-amber-400",
  in_progress: "border-t-orange-400",
  completed: "border-t-emerald-400",
  disputed: "border-t-red-400"
};

export const TRADE_ORDER: readonly TradeType[] = [
  "signage",
  "blinds",
  "painting",
  "plumbing",
  "electrical",
  "cleaning",
  "security",
  "general"
] as const;

export const TRADE_LABEL: Record<TradeType, string> = {
  signage: "Signage",
  blinds: "Blinds",
  painting: "Painting",
  plumbing: "Plumbing",
  electrical: "Electrical",
  cleaning: "Cleaning",
  security: "Security",
  general: "General"
};

// A job counts as open until it is completed (disputed still needs attention).
export function isOpenStatus(status: VendorJobStatus): boolean {
  return status !== "completed";
}

// Group a flat list of jobs into ordered columns by status.
export function toColumns(items: VendorJobItem[]): VendorJobColumn[] {
  return STATUS_ORDER.map((status) => ({
    status,
    items: items.filter((it) => it.status === status)
  }));
}
