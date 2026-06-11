// Pure analytics logic. No Supabase, no React, so it stays unit-testable
// and is shared by both the live query path and the mock path.

import { addDaysIso, isoBetween } from "@/lib/utils";
import type {
  DepositsAnalytics,
  DepositSpaceRow,
  DepositStatus,
  EnquiryStage,
  FunnelStageStat,
  OccupancyHistory,
  OccupancyHistoryMonth,
  OccupancyHistorySpace,
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

// Minimal deposit shape for the per-space tracker, so callers can pass either
// live rows or mock rows without coupling to the full table type.
export type DepositForAnalytics = {
  propertyId: string;
  status: DepositStatus;
  deductionAmountPence: number | null;
  checkoutDate: string;          // ISO YYYY-MM-DD
};

// A deduction counts once it has been proposed, approved or processed.
const DEDUCTING_STATUSES: readonly DepositStatus[] = [
  "deduction_proposed",
  "approved",
  "processed"
] as const;

// A deposit is still held until it has been processed or auto refunded.
const SETTLED_STATUSES: readonly DepositStatus[] = ["processed", "auto_refunded"] as const;

function deductionPence(deposit: DepositForAnalytics): number {
  if (!DEDUCTING_STATUSES.includes(deposit.status)) return 0;
  return deposit.deductionAmountPence ?? 0;
}

// Per-property deposit stats plus the headline total deducted this calendar
// year (by checkout date). Every property gets a row, zeros included, so the
// bars are stable; rows are sorted with the biggest deductions first.
export function buildDepositsAnalytics(
  properties: { id: string; name: string }[],
  deposits: DepositForAnalytics[],
  todayIso: string
): DepositsAnalytics {
  const currentYear = todayIso.slice(0, 4);

  const bySpace: DepositSpaceRow[] = properties
    .map((property) => {
      const propDeposits = deposits.filter((d) => d.propertyId === property.id);
      return {
        propertyId: property.id,
        propertyName: property.name,
        heldCount: propDeposits.filter((d) => !SETTLED_STATUSES.includes(d.status)).length,
        deductedPence: propDeposits.reduce((sum, d) => sum + deductionPence(d), 0),
        refundedCount: propDeposits.filter((d) => d.status === "auto_refunded").length
      };
    })
    .sort((a, b) => b.deductedPence - a.deductedPence);

  const totalDeductedThisYearPence = deposits
    .filter((d) => d.checkoutDate.slice(0, 4) === currentYear)
    .reduce((sum, d) => sum + deductionPence(d), 0);

  return { bySpace, totalDeductedThisYearPence };
}

// Minimal space_metrics shape for the occupancy history section, so callers
// can pass either live rows or mock rows without coupling to the table type.
export type SpaceMetricForHistory = {
  propertyId: string;
  month: string;        // ISO YYYY-MM-DD, first of month
  bookedDays: number;
  ttvPence: number;
};

// Days elapsed this calendar year, inclusive of today. UTC maths on the ISO
// parts, same approach as addDaysIso, so there is no timezone drift.
function daysElapsedThisYear(todayIso: string): number {
  const [y, m, d] = todayIso.split("-").map(Number) as [number, number, number];
  const elapsedMs = Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1);
  return Math.round(elapsedMs / 86_400_000) + 1;
}

// Year-to-date history from the imported space_metrics rows. Per space:
// booked days, TTV, occupancy (booked days over days elapsed this year,
// capped at 100), average day rate and last year's TTV for comparison. Plus
// a monthly TTV/booked-days series for the current year across all spaces,
// always Jan..Dec with missing months as zero. Only spaces that actually have
// rows appear; the current year is taken from todayIso.
export function buildOccupancyHistory(
  rows: SpaceMetricForHistory[],
  propertyNames: Map<string, string>,
  todayIso: string
): OccupancyHistory {
  const currentYear = todayIso.slice(0, 4);
  const priorYear = String(Number(currentYear) - 1);
  const elapsedDays = Math.max(1, daysElapsedThisYear(todayIso));

  const propertyIds = [...new Set(rows.map((r) => r.propertyId))];
  const bySpace: OccupancyHistorySpace[] = propertyIds
    .map((propertyId) => {
      const propRows = rows.filter((r) => r.propertyId === propertyId);
      const thisYearRows = propRows.filter((r) => r.month.slice(0, 4) === currentYear);
      const bookedDays = thisYearRows.reduce((sum, r) => sum + r.bookedDays, 0);
      const ttvPence = thisYearRows.reduce((sum, r) => sum + r.ttvPence, 0);
      const priorYearTtvPence = propRows
        .filter((r) => r.month.slice(0, 4) === priorYear)
        .reduce((sum, r) => sum + r.ttvPence, 0);
      return {
        propertyId,
        name: propertyNames.get(propertyId) ?? "Unknown space",
        currentYearBookedDays: bookedDays,
        currentYearTtvPence: ttvPence,
        currentYearOccupancyPct: Math.min(100, Math.round((bookedDays / elapsedDays) * 100)),
        avgDayRatePence: bookedDays === 0 ? 0 : Math.round(ttvPence / bookedDays),
        priorYearTtvPence
      };
    })
    .sort(
      (a, b) =>
        b.currentYearTtvPence - a.currentYearTtvPence || a.name.localeCompare(b.name)
    );

  const monthly: OccupancyHistoryMonth[] = [];
  for (let m = 1; m <= 12; m++) {
    const month = `${currentYear}-${String(m).padStart(2, "0")}`;
    const monthRows = rows.filter((r) => r.month.slice(0, 7) === month);
    monthly.push({
      month,
      ttvPence: monthRows.reduce((sum, r) => sum + r.ttvPence, 0),
      bookedDays: monthRows.reduce((sum, r) => sum + r.bookedDays, 0)
    });
  }

  return { bySpace, monthly };
}
