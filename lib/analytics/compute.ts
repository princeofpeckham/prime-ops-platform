// Pure analytics logic. No Supabase, no React, so it stays unit-testable
// and is shared by both the live query path and the mock path.

import { addDaysIso, isoBetween } from "@/lib/utils";
import type {
  EnquiryStage,
  FunnelStageStat,
  OccupancyRow,
  PropertyTier
} from "./types";

// Funnel order matches the inbox board, lost shown last for context.
export const FUNNEL_ORDER: readonly EnquiryStage[] = [
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

// Bar colour per stage so the funnel reads at a glance. Lost is muted red.
export const STAGE_BAR: Record<EnquiryStage, string> = {
  request: "bg-neutral-400",
  viewing: "bg-blue-400",
  in_offer: "bg-amber-400",
  pre_check_in: "bg-violet-400",
  in_tenancy: "bg-emerald-400",
  post_check_out: "bg-neutral-300",
  lost: "bg-red-300"
};

export const OCCUPANCY_WINDOW_DAYS = 30;

// An enquiry counts as open pipeline unless it is lost.
export function isOpenStage(stage: EnquiryStage): boolean {
  return stage !== "lost";
}

// Count enquiries per stage, in funnel order, always returning every stage
// (zeros included) so the chart has a stable set of bars.
export function buildFunnel(stages: EnquiryStage[]): FunnelStageStat[] {
  const counts = new Map<EnquiryStage, number>();
  for (const stage of stages) counts.set(stage, (counts.get(stage) ?? 0) + 1);
  return FUNNEL_ORDER.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
}

// Minimal shape needed to compute occupancy, so callers can pass either live
// rows or mock rows without coupling to the full table type.
export type OccupancyProperty = { id: string; name: string; tier: PropertyTier };
export type OccupancyBooking = {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
};

// Occupancy proxy: of the next 30 calendar days, what share has at least one
// booking overlapping it, per property. Counts distinct booked days so two
// overlapping bookings do not double count.
export function buildOccupancy(
  properties: OccupancyProperty[],
  bookings: OccupancyBooking[],
  windowStart: string,
  windowDays: number = OCCUPANCY_WINDOW_DAYS
): OccupancyRow[] {
  const days: string[] = [];
  for (let i = 0; i < windowDays; i++) days.push(addDaysIso(windowStart, i));

  return properties.map((property) => {
    const propBookings = bookings.filter((b) => b.propertyId === property.id);
    let bookedDays = 0;
    for (const iso of days) {
      const booked = propBookings.some((b) =>
        isoBetween(iso, b.checkInDate, b.checkOutDate)
      );
      if (booked) bookedDays += 1;
    }
    const occupancyPct = windowDays === 0 ? 0 : Math.round((bookedDays / windowDays) * 100);
    return {
      propertyId: property.id,
      propertyName: property.name,
      tier: property.tier,
      bookedDays,
      windowDays,
      occupancyPct
    };
  });
}

export function tierTone(tier: PropertyTier): "accent" | "good" | "muted" {
  if (tier === "prime") return "accent";
  if (tier === "pro") return "good";
  return "muted";
}
