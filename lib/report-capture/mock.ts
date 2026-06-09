// Deterministic demo data for the brand host capture screens in mock/preview
// mode. Bookings feed the picker; reports feed the "my reports" list. Dates are
// relative to today so everything reads as current.

import { addDaysIso, londonToday } from "@/lib/utils";
import type {
  CaptureBooking,
  CaptureData,
  ConditionAreaState,
  ConditionOverall,
  ConditionReportType,
  MyReportItem,
  MyReportsData
} from "./types";

type BookingSeed = {
  id: string;
  ref: string;
  brand: string;
  propertyId: string;
  propertyName: string;
  checkInOffset: number;
  durationDays: number;
};

const BOOKING_SEEDS: BookingSeed[] = [
  { id: "b-ganni", ref: "BK-GANNI", brand: "Ganni", propertyId: "p-greek-st", propertyName: "Greek St", checkInOffset: -4, durationDays: 35 },
  { id: "b-glossier", ref: "BK-GLOSSIER", brand: "Glossier", propertyId: "p-greek-st", propertyName: "Greek St", checkInOffset: 2, durationDays: 42 },
  { id: "b-aesop", ref: "BK-AESOP", brand: "Aesop", propertyId: "p-darblay", propertyName: "D'arblay", checkInOffset: -10, durationDays: 60 },
  { id: "b-reformation", ref: "BK-REFORMATION", brand: "Reformation", propertyId: "p-paddington", propertyName: "Paddington", checkInOffset: 3, durationDays: 30 },
  { id: "b-polaroid", ref: "BK-POLAROID", brand: "Polaroid", propertyId: "p-hay-hill", propertyName: "Hay Hill", checkInOffset: 1, durationDays: 21 },
  { id: "b-allbirds", ref: "BK-ALLBIRDS", brand: "Allbirds", propertyId: "p-paddington", propertyName: "Paddington", checkInOffset: -1, durationDays: 14 }
];

function buildBooking(seed: BookingSeed, todayIso: string): CaptureBooking {
  return {
    id: seed.id,
    ref: seed.ref,
    brandName: seed.brand,
    propertyId: seed.propertyId,
    propertyName: seed.propertyName,
    checkInDate: addDaysIso(todayIso, seed.checkInOffset),
    checkOutDate: addDaysIso(todayIso, seed.checkInOffset + seed.durationDays)
  };
}

export function generateMockCapture(now: Date = new Date()): CaptureData {
  const todayIso = londonToday(now);
  return {
    bookings: BOOKING_SEEDS.map((s) => buildBooking(s, todayIso)),
    source: "mock",
    generatedAt: now.toISOString()
  };
}

type ReportSeed = {
  id: string;
  ref: string;
  brand: string;
  propertyName: string;
  type: ConditionReportType;
  overall: ConditionOverall | null;
  hasDamage: boolean;
  areaCount: number;
  summary: string;
  // Days from today this report was created / submitted.
  createdOffset: number;
  submittedOffset: number | null;
};

const REPORT_SEEDS: ReportSeed[] = [
  { id: "mr-1", ref: "BK-GANNI", brand: "Ganni", propertyName: "Greek St", type: "check_in", overall: "good", hasDamage: false, areaCount: 5, summary: "Clean hand over, all areas fine and ready for fit out.", createdOffset: -4, submittedOffset: -4 },
  { id: "mr-2", ref: "BK-DIPTYQUE", brand: "Diptyque", propertyName: "Hay Hill", type: "check_out", overall: "minor_issues", hasDamage: true, areaCount: 5, summary: "Scuffed wall by the entrance and a chipped windowsill on check out.", createdOffset: -1, submittedOffset: -1 },
  { id: "mr-3", ref: "BK-GLOSSIER", brand: "Glossier", propertyName: "Greek St", type: "check_in", overall: "good", hasDamage: false, areaCount: 6, summary: "Walkthrough complete, space in good order.", createdOffset: -6, submittedOffset: -6 },
  { id: "mr-4", ref: "BK-AESOP", brand: "Aesop", propertyName: "D'arblay", type: "check_out", overall: "damage", hasDamage: true, areaCount: 5, summary: "Damaged shelving unit and a missing key fob flagged for review.", createdOffset: -2, submittedOffset: -2 },
  { id: "mr-5", ref: "BK-POLAROID", brand: "Polaroid", propertyName: "Hay Hill", type: "check_in", overall: "good", hasDamage: false, areaCount: 5, summary: "Clean hand over, signage points noted.", createdOffset: -8, submittedOffset: -8 },
  { id: "mr-6", ref: "BK-ALLBIRDS", brand: "Allbirds", propertyName: "Paddington", type: "check_out", overall: "minor_issues", hasDamage: false, areaCount: 5, summary: "General wear from footfall, nothing chargeable.", createdOffset: -3, submittedOffset: -3 },
  { id: "mr-7", ref: "BK-REFORMATION", brand: "Reformation", propertyName: "Paddington", type: "check_in", overall: "good", hasDamage: false, areaCount: 5, summary: "Space handed over clean ahead of check in.", createdOffset: -9, submittedOffset: -9 },
  { id: "mr-8", ref: "BK-SKIMS", brand: "Skims", propertyName: "Greek St", type: "check_out", overall: "damage", hasDamage: true, areaCount: 6, summary: "Cracked window pane and a damaged floor tile in the back room.", createdOffset: -1, submittedOffset: -1 },
  { id: "mr-9", ref: "BK-MEJURI", brand: "Mejuri", propertyName: "Greek St", type: "check_out", overall: "minor_issues", hasDamage: false, areaCount: 5, summary: "Minor scuffing to skirting, otherwise clean.", createdOffset: -5, submittedOffset: -5 },
  { id: "mr-10", ref: "BK-LEMAIRE", brand: "Lemaire", propertyName: "D'arblay", type: "check_in", overall: "good", hasDamage: false, areaCount: 5, summary: "Showroom handed over in excellent condition.", createdOffset: -12, submittedOffset: -12 }
];

function offsetToIso(todayIso: string, offset: number | null): string | null {
  return offset === null ? null : `${addDaysIso(todayIso, offset)}T10:00:00Z`;
}

function buildReport(seed: ReportSeed, todayIso: string): MyReportItem {
  return {
    id: seed.id,
    bookingRef: seed.ref,
    brandName: seed.brand,
    propertyName: seed.propertyName,
    type: seed.type,
    overallCondition: seed.overall,
    hasDamageFlags: seed.hasDamage,
    areaCount: seed.areaCount,
    summary: seed.summary,
    submittedAt: offsetToIso(todayIso, seed.submittedOffset),
    createdAt: offsetToIso(todayIso, seed.createdOffset) ?? `${todayIso}T10:00:00Z`
  };
}

export function generateMockMyReports(now: Date = new Date()): MyReportsData {
  const todayIso = londonToday(now);
  const items = REPORT_SEEDS.map((s) => buildReport(s, todayIso)).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return {
    items,
    totalCount: items.length,
    damageCount: items.filter((it) => it.hasDamageFlags).length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
