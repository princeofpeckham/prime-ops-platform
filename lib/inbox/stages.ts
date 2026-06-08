// Pure funnel-stage logic. No Supabase, no React, so it is unit-testable.

import type { EnquiryItem, EnquiryStage, InboxColumn } from "./types";

export const STAGE_ORDER: readonly EnquiryStage[] = [
  "request",
  "viewing",
  "in_offer",
  "pre_check_in",
  "in_tenancy",
  "post_check_out",
  "lost"
] as const;

export const STAGE_LABEL: Record<EnquiryStage, string> = {
  request: "Request",
  viewing: "Viewing",
  in_offer: "In offer",
  pre_check_in: "Pre check in",
  in_tenancy: "In tenancy",
  post_check_out: "Post check out",
  lost: "Lost"
};

// Tailwind border-top accent per column, so the board reads at a glance.
export const STAGE_ACCENT: Record<EnquiryStage, string> = {
  request: "border-t-neutral-400",
  viewing: "border-t-blue-400",
  in_offer: "border-t-amber-400",
  pre_check_in: "border-t-violet-400",
  in_tenancy: "border-t-emerald-400",
  post_check_out: "border-t-neutral-300",
  lost: "border-t-red-300"
};

// The stage at which an enquiry becomes a real booking.
export const PROMOTE_STAGE: EnquiryStage = "in_offer";

export function nextStage(stage: EnquiryStage): EnquiryStage | null {
  if (stage === "lost") return null;
  const linear: EnquiryStage[] = [
    "request",
    "viewing",
    "in_offer",
    "pre_check_in",
    "in_tenancy",
    "post_check_out"
  ];
  const i = linear.indexOf(stage);
  if (i === -1 || i === linear.length - 1) return null;
  return linear[i + 1] ?? null;
}

// Promotion to a booking is offered once the enquiry is at in_offer or beyond
// (but not lost), and only when it is not already linked to a booking.
export function canPromote(item: Pick<EnquiryItem, "stage" | "bookingId">): boolean {
  if (item.bookingId) return false;
  const promotable: EnquiryStage[] = [
    "in_offer",
    "pre_check_in",
    "in_tenancy",
    "post_check_out"
  ];
  return promotable.includes(item.stage);
}

// Group a flat list of enquiries into ordered columns by stage.
export function toColumns(items: EnquiryItem[]): InboxColumn[] {
  return STAGE_ORDER.map((stage) => ({
    stage,
    items: items.filter((it) => it.stage === stage)
  }));
}
