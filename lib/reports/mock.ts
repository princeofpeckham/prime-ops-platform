// Deterministic demo condition reports for mock/preview mode. The areas for
// the focal booking (b-diptyque) tell a believable before/after story so the
// compare view at /reports/compare/b-diptyque looks alive.

import { addDaysIso, londonToday } from "@/lib/utils";
import { alignAreas } from "./labels";
import type {
  AreaDetail,
  CompareData,
  ConditionAreaState,
  ConditionOverall,
  ConditionReportStatus,
  ConditionReportType,
  ReportItem,
  ReportSide,
  ReportsData
} from "./types";

type ReportSeed = {
  id: string;
  bookingId: string;
  bookingRef: string;
  brand: string;
  propertyName: string;
  type: ConditionReportType;
  status: ConditionReportStatus;
  overall: ConditionOverall | null;
  hasDamage: boolean;
  summary: string;
  // Days from today the report was created / submitted / reviewed.
  createdOffset: number;
  submittedOffset: number | null;
  reviewedOffset: number | null;
};

const PROPERTY_BY_BOOKING: Record<string, string> = {
  "b-diptyque": "p-hay-hill"
};

const REPORTS: ReportSeed[] = [
  { id: "cr-1", bookingId: "b-diptyque", bookingRef: "BK-DIPTYQUE", brand: "Diptyque", propertyName: "Hay Hill", type: "check_in", status: "reviewed", overall: "good", hasDamage: false, summary: "Space handed over clean and in good order.", createdOffset: -21, submittedOffset: -21, reviewedOffset: -20 },
  { id: "cr-2", bookingId: "b-diptyque", bookingRef: "BK-DIPTYQUE", brand: "Diptyque", propertyName: "Hay Hill", type: "check_out", status: "submitted", overall: "minor_issues", hasDamage: true, summary: "Scuffed wall by the entrance and a chipped windowsill on check out.", createdOffset: -1, submittedOffset: -1, reviewedOffset: null },
  { id: "cr-3", bookingId: "b-glossier", bookingRef: "BK-GLOSSIER", brand: "Glossier", propertyName: "Greek St", type: "check_in", status: "reviewed", overall: "good", hasDamage: false, summary: "All areas fine at hand over.", createdOffset: -14, submittedOffset: -14, reviewedOffset: -13 },
  { id: "cr-4", bookingId: "b-ganni", bookingRef: "BK-GANNI", brand: "Ganni", propertyName: "Greek St", type: "check_in", status: "submitted", overall: "good", hasDamage: false, summary: "Check in walkthrough complete, ready for fit out.", createdOffset: -3, submittedOffset: -3, reviewedOffset: null },
  { id: "cr-5", bookingId: "b-aesop", bookingRef: "BK-AESOP", brand: "Aesop", propertyName: "D'arblay", type: "check_out", status: "submitted", overall: "damage", hasDamage: true, summary: "Damaged shelving unit and missing key fob flagged for deposit review.", createdOffset: -2, submittedOffset: -2, reviewedOffset: null },
  { id: "cr-6", bookingId: "b-reformation", bookingRef: "BK-REFORMATION", brand: "Reformation", propertyName: "Paddington", type: "check_in", status: "draft", overall: null, hasDamage: false, summary: "Walkthrough in progress ahead of check in.", createdOffset: 0, submittedOffset: null, reviewedOffset: null },
  { id: "cr-7", bookingId: "b-allbirds", bookingRef: "BK-ALLBIRDS", brand: "Allbirds", propertyName: "Paddington", type: "check_out", status: "reviewed", overall: "minor_issues", hasDamage: false, summary: "General wear from footfall, no chargeable damage.", createdOffset: -9, submittedOffset: -9, reviewedOffset: -8 },
  { id: "cr-8", bookingId: "b-mejuri", bookingRef: "BK-MEJURI", brand: "Mejuri", propertyName: "Greek St", type: "check_out", status: "submitted", overall: "minor_issues", hasDamage: false, summary: "Minor scuffing to skirting, otherwise clean.", createdOffset: -1, submittedOffset: -1, reviewedOffset: null },
  { id: "cr-9", bookingId: "b-polaroid", bookingRef: "BK-POLAROID", brand: "Polaroid", propertyName: "Hay Hill", type: "check_in", status: "submitted", overall: "good", hasDamage: false, summary: "Clean hand over, signage points noted.", createdOffset: -4, submittedOffset: -4, reviewedOffset: null },
  { id: "cr-10", bookingId: "b-skims", bookingRef: "BK-SKIMS", brand: "Skims", propertyName: "Greek St", type: "check_out", status: "submitted", overall: "damage", hasDamage: true, summary: "Cracked window pane and damaged floor tile in the back room.", createdOffset: -1, submittedOffset: -1, reviewedOffset: null },
  { id: "cr-11", bookingId: "b-lemaire", bookingRef: "BK-LEMAIRE", brand: "Lemaire", propertyName: "D'arblay", type: "check_in", status: "reviewed", overall: "good", hasDamage: false, summary: "Showroom handed over in excellent condition.", createdOffset: -16, submittedOffset: -16, reviewedOffset: -15 }
];

// Areas for the focal Diptyque booking: a clear before (check in) and after
// (check out), so the compare view shows fine then minor_wear and fine then damage.
type AreaSeed = {
  reportId: string;
  areaName: string;
  condition: ConditionAreaState;
  notes: string | null;
};

const AREAS: AreaSeed[] = [
  // Check in (cr-1): everything fine.
  { reportId: "cr-1", areaName: "Main Floor", condition: "fine", notes: "Polished concrete clean, no marks." },
  { reportId: "cr-1", areaName: "Walls", condition: "fine", notes: "Freshly painted, no scuffs." },
  { reportId: "cr-1", areaName: "Kitchen", condition: "fine", notes: "Units and worktop spotless." },
  { reportId: "cr-1", areaName: "Windows", condition: "fine", notes: "Glazing intact and clean." },
  // Check out (cr-2): wear and damage appear.
  { reportId: "cr-2", areaName: "Main Floor", condition: "minor_wear", notes: "Light surface scratches from display fixtures." },
  { reportId: "cr-2", areaName: "Walls", condition: "minor_wear", notes: "Scuff marks near the entrance, touch up needed." },
  { reportId: "cr-2", areaName: "Kitchen", condition: "fine", notes: "Left clean, no issues." },
  { reportId: "cr-2", areaName: "Windows", condition: "damage", notes: "Chipped windowsill, paint cracked. Flagged for deposit." }
];

function offsetToIso(todayIso: string, offset: number | null): string | null {
  return offset === null ? null : `${addDaysIso(todayIso, offset)}T10:00:00Z`;
}

function buildItem(seed: ReportSeed, todayIso: string): ReportItem {
  return {
    id: seed.id,
    bookingId: seed.bookingId,
    bookingRef: seed.bookingRef,
    brandName: seed.brand,
    propertyId: PROPERTY_BY_BOOKING[seed.bookingId] ?? `p-${seed.bookingId}`,
    propertyName: seed.propertyName,
    type: seed.type,
    status: seed.status,
    overallCondition: seed.overall,
    hasDamageFlags: seed.hasDamage,
    summary: seed.summary,
    submittedAt: offsetToIso(todayIso, seed.submittedOffset),
    reviewedAt: offsetToIso(todayIso, seed.reviewedOffset),
    createdAt: offsetToIso(todayIso, seed.createdOffset) ?? `${todayIso}T10:00:00Z`
  };
}

export function generateMockReports(now: Date = new Date()): ReportsData {
  const todayIso = londonToday(now);
  const items = REPORTS.map((s) => buildItem(s, todayIso))
    // Awaiting review first, then most recent.
    .sort((a, b) => {
      const aPending = a.status === "submitted" ? 0 : 1;
      const bPending = b.status === "submitted" ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return b.createdAt.localeCompare(a.createdAt);
    });

  return {
    items,
    submittedCount: items.filter((it) => it.status === "submitted").length,
    damageCount: items.filter((it) => it.hasDamageFlags).length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}

function areasFor(reportId: string): AreaDetail[] {
  return AREAS.filter((a) => a.reportId === reportId).map((a) => ({
    id: `${a.reportId}-${a.areaName.toLowerCase().replace(/\s+/g, "-")}`,
    areaName: a.areaName,
    condition: a.condition,
    notes: a.notes
  }));
}

function buildSide(seed: ReportSeed | undefined, todayIso: string): ReportSide | null {
  if (!seed) return null;
  return {
    id: seed.id,
    type: seed.type,
    status: seed.status,
    overallCondition: seed.overall,
    hasDamageFlags: seed.hasDamage,
    summary: seed.summary,
    submittedAt: offsetToIso(todayIso, seed.submittedOffset),
    reviewedAt: offsetToIso(todayIso, seed.reviewedOffset),
    areas: areasFor(seed.id)
  };
}

export function generateMockCompare(bookingId: string, now: Date = new Date()): CompareData {
  const todayIso = londonToday(now);
  const forBooking = REPORTS.filter((r) => r.bookingId === bookingId);
  const ciSeed = forBooking.find((r) => r.type === "check_in");
  const coSeed = forBooking.find((r) => r.type === "check_out");
  const meta = forBooking[0];

  const checkIn = buildSide(ciSeed, todayIso);
  const checkOut = buildSide(coSeed, todayIso);

  return {
    bookingId,
    bookingRef: meta?.bookingRef ?? null,
    brandName: meta?.brand ?? null,
    propertyName: meta?.propertyName ?? null,
    checkIn,
    checkOut,
    rows: alignAreas(checkIn, checkOut),
    source: "mock",
    generatedAt: now.toISOString()
  };
}
