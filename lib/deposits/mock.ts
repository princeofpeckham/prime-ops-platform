// Deterministic demo deposits for mock/preview mode.
// Deadlines are relative to today so countdowns feel current; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { isDueSoon, sortByUrgency } from "./status";
import type { DepositItem, DepositsData, DepositStatus } from "./types";

type Seed = {
  id: string;
  brand: string;
  property: string;
  checkoutOffset: number;        // days from today the tenancy checked out
  deadlineOffset: number;        // days from today the refund decision is due (negative = overdue)
  status: DepositStatus;
  deductionAmountPence: number | null;
  deductionReason: string | null;
  approvedOffset: number | null; // days from today the deposit was approved
  processedOffset: number | null;
};

// Eight deposits: a couple due within three days, one overdue, the rest spread out.
const SEEDS: Seed[] = [
  { id: "d1", brand: "Diptyque", property: "Hay Hill", checkoutOffset: -19, deadlineOffset: -2, status: "pending_review", deductionAmountPence: null, deductionReason: null, approvedOffset: null, processedOffset: null },
  { id: "d2", brand: "Glossier", property: "Greek St", checkoutOffset: -16, deadlineOffset: 1, status: "pending_review", deductionAmountPence: null, deductionReason: null, approvedOffset: null, processedOffset: null },
  { id: "d3", brand: "Aesop", property: "D'arblay", checkoutOffset: -15, deadlineOffset: 3, status: "deduction_proposed", deductionAmountPence: 45000, deductionReason: "Scuffed plaster on the rear wall, repaint quoted by the decorator.", approvedOffset: null, processedOffset: null },
  { id: "d4", brand: "Ganni", property: "Greek St", checkoutOffset: -12, deadlineOffset: 6, status: "deduction_proposed", deductionAmountPence: 18000, deductionReason: "Two replacement ceiling spotlights and a callout for the electrician.", approvedOffset: null, processedOffset: null },
  { id: "d5", brand: "Reformation", property: "Paddington", checkoutOffset: -11, deadlineOffset: 8, status: "approved", deductionAmountPence: 0, deductionReason: "Space returned in good condition, full refund approved.", approvedOffset: -1, processedOffset: null },
  { id: "d6", brand: "Allbirds", property: "Paddington", checkoutOffset: -10, deadlineOffset: 10, status: "approved", deductionAmountPence: 32000, deductionReason: "Vinyl flooring scratched near the entrance, partial deduction agreed.", approvedOffset: -2, processedOffset: null },
  { id: "d7", brand: "Mejuri", property: "Greek St", checkoutOffset: -28, deadlineOffset: -7, status: "processed", deductionAmountPence: 0, deductionReason: "No damage flagged, deposit returned in full.", approvedOffset: -10, processedOffset: -6 },
  { id: "d8", brand: "Polaroid", property: "Hay Hill", checkoutOffset: -24, deadlineOffset: -3, status: "auto_refunded", deductionAmountPence: null, deductionReason: null, approvedOffset: null, processedOffset: -1 }
];

function buildItem(seed: Seed, todayIso: string): DepositItem {
  return {
    id: seed.id,
    bookingId: `bk-${seed.id}`,
    propertyId: `p-${seed.property.toLowerCase().replace(/[^a-z]/g, "")}`,
    propertyName: seed.property,
    brandName: seed.brand,
    checkoutDate: addDaysIso(todayIso, seed.checkoutOffset),
    deadlineDate: addDaysIso(todayIso, seed.deadlineOffset),
    status: seed.status,
    deductionAmountPence: seed.deductionAmountPence,
    deductionReason: seed.deductionReason,
    approvedAt: seed.approvedOffset === null ? null : `${addDaysIso(todayIso, seed.approvedOffset)}T11:00:00Z`,
    processedAt: seed.processedOffset === null ? null : `${addDaysIso(todayIso, seed.processedOffset)}T11:00:00Z`,
    createdAt: `${addDaysIso(todayIso, seed.checkoutOffset)}T17:00:00Z`
  };
}

export function generateMockDeposits(now: Date = new Date()): DepositsData {
  const todayIso = londonToday(now);
  const items = SEEDS.map((s) => buildItem(s, todayIso));
  const sorted = sortByUrgency(items);
  return {
    items: sorted,
    pendingReviewCount: items.filter((it) => it.status === "pending_review").length,
    dueSoonCount: items.filter((it) => isDueSoon(it, now)).length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
