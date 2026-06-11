// Deterministic demo analytics for mock/preview mode. Dates are relative to
// today so the occupancy window and booking tables feel current. Every chart
// is guaranteed non-empty: enquiries cover every stage, bookings overlap the
// next 30 days, shifts span open and completed, and vendors are populated.

import { addDaysIso, londonToday } from "@/lib/utils";
import {
  OCCUPANCY_WINDOW_DAYS,
  buildDepositsAnalytics,
  buildFunnel,
  buildOccupancy,
  isOpenStage
} from "./compute";
import type { DepositForAnalytics } from "./compute";
import type {
  AnalyticsData,
  BookingRow,
  EnquiryRow,
  EnquiryStage,
  HeadlineMetrics,
  PropertyRow,
  ShiftRow,
  VendorRow
} from "./types";

type DemoProperty = { id: string; name: string; tier: PropertyRow["tier"]; status: PropertyRow["status"]; address: string };

const DEMO_PROPERTIES: DemoProperty[] = [
  { id: "p-greek-st", name: "Greek St", tier: "prime", status: "active", address: "12 Greek Street, Soho" },
  { id: "p-darblay", name: "D'arblay", tier: "prime", status: "active", address: "30 D'arblay Street, Soho" },
  { id: "p-hay-hill", name: "Hay Hill", tier: "prime", status: "active", address: "8 Hay Hill, Mayfair" },
  { id: "p-paddington", name: "Paddington", tier: "pro", status: "active", address: "5 Sheldon Square, Paddington" },
  { id: "p-eastcastle", name: "Eastcastle", tier: "pro", status: "fit_out", address: "44 Eastcastle Street, Fitzrovia" }
];

const PROPERTY_NAME = new Map(DEMO_PROPERTIES.map((p) => [p.id, p.name]));

type EnquirySeed = {
  id: string;
  brand: string;
  stage: EnquiryStage;
  valuePence: number | null;
  propertyId: string | null;
};

const ENQUIRY_SEEDS: EnquirySeed[] = [
  { id: "e1", brand: "Mejuri", stage: "request", valuePence: 1800000, propertyId: "p-greek-st" },
  { id: "e2", brand: "Oatly", stage: "request", valuePence: 950000, propertyId: null },
  { id: "e3", brand: "Skims", stage: "request", valuePence: 5200000, propertyId: "p-greek-st" },
  { id: "e4", brand: "Polaroid", stage: "viewing", valuePence: 2400000, propertyId: "p-hay-hill" },
  { id: "e5", brand: "Glossier", stage: "viewing", valuePence: 3200000, propertyId: "p-greek-st" },
  { id: "e6", brand: "Lemaire", stage: "viewing", valuePence: 1900000, propertyId: "p-darblay" },
  { id: "e7", brand: "Aesop", stage: "in_offer", valuePence: 4100000, propertyId: "p-darblay" },
  { id: "e8", brand: "Allbirds", stage: "in_offer", valuePence: 1500000, propertyId: "p-paddington" },
  { id: "e9", brand: "Reformation", stage: "pre_check_in", valuePence: 2800000, propertyId: "p-eastcastle" },
  { id: "e10", brand: "Ganni", stage: "in_tenancy", valuePence: 3600000, propertyId: "p-greek-st" },
  { id: "e11", brand: "Diptyque", stage: "post_check_out", valuePence: 2100000, propertyId: "p-hay-hill" },
  { id: "e12", brand: "Cuyana", stage: "lost", valuePence: 700000, propertyId: null }
];

// Bookings keyed by day offsets from today so several overlap the 30 day window.
type BookingSeed = {
  id: string;
  externalId: string;
  brand: string;
  propertyId: string;
  startOffset: number;
  durationDays: number;
  ttvPence: number;
  status: BookingRow["status"];
};

const BOOKING_SEEDS: BookingSeed[] = [
  { id: "b1", externalId: "ENQ-AESOP01", brand: "Aesop", propertyId: "p-darblay", startOffset: -10, durationDays: 60, ttvPence: 4100000, status: "active" },
  { id: "b2", externalId: "ENQ-GANNI01", brand: "Ganni", propertyId: "p-greek-st", startOffset: -4, durationDays: 35, ttvPence: 3600000, status: "active" },
  { id: "b3", externalId: "ENQ-ALLB01", brand: "Allbirds", propertyId: "p-paddington", startOffset: 7, durationDays: 14, ttvPence: 1500000, status: "confirmed" },
  { id: "b4", externalId: "ENQ-REFM01", brand: "Reformation", propertyId: "p-eastcastle", startOffset: 3, durationDays: 30, ttvPence: 2800000, status: "confirmed" },
  { id: "b5", externalId: "ENQ-GLOS01", brand: "Glossier", propertyId: "p-greek-st", startOffset: 40, durationDays: 42, ttvPence: 3200000, status: "confirmed" },
  { id: "b6", externalId: "ENQ-POLA01", brand: "Polaroid", propertyId: "p-hay-hill", startOffset: 14, durationDays: 21, ttvPence: 2400000, status: "confirmed" },
  { id: "b7", externalId: "ENQ-DIPT01", brand: "Diptyque", propertyId: "p-hay-hill", startOffset: -25, durationDays: 14, ttvPence: 2100000, status: "completed" },
  { id: "b8", externalId: "ENQ-LEMA01", brand: "Lemaire", propertyId: "p-darblay", startOffset: 25, durationDays: 21, ttvPence: 1900000, status: "confirmed" }
];

// Shifts across the window: a mix of completed, assigned, applied and open.
type ShiftSeed = {
  id: string;
  type: ShiftRow["type"];
  status: ShiftRow["status"];
  dayOffset: number;
  propertyId: string;
};

const SHIFT_SEEDS: ShiftSeed[] = [
  { id: "s1", type: "check_out", status: "completed", dayOffset: -11, propertyId: "p-hay-hill" },
  { id: "s2", type: "check_in", status: "completed", dayOffset: -10, propertyId: "p-darblay" },
  { id: "s3", type: "check_in", status: "completed", dayOffset: -4, propertyId: "p-greek-st" },
  { id: "s4", type: "viewing", status: "completed", dayOffset: -2, propertyId: "p-greek-st" },
  { id: "s5", type: "check_in", status: "assigned", dayOffset: 3, propertyId: "p-eastcastle" },
  { id: "s6", type: "check_in", status: "assigned", dayOffset: 7, propertyId: "p-paddington" },
  { id: "s7", type: "viewing", status: "applied", dayOffset: 2, propertyId: "p-hay-hill" },
  { id: "s8", type: "check_in", status: "open", dayOffset: 14, propertyId: "p-hay-hill" },
  { id: "s9", type: "check_out", status: "open", dayOffset: 21, propertyId: "p-paddington" },
  { id: "s10", type: "check_in", status: "open", dayOffset: 40, propertyId: "p-greek-st" }
];

// Deposit seeds mirror the deposits screen mock: same brands, properties and
// deduction amounts, with checkout dates relative to today (all this year).
type DepositSeed = {
  propertyId: string;
  status: DepositForAnalytics["status"];
  deductionAmountPence: number | null;
  checkoutOffset: number;
};

const DEPOSIT_SEEDS: DepositSeed[] = [
  { propertyId: "p-hay-hill", status: "pending_review", deductionAmountPence: null, checkoutOffset: -19 },
  { propertyId: "p-greek-st", status: "pending_review", deductionAmountPence: null, checkoutOffset: -16 },
  { propertyId: "p-darblay", status: "deduction_proposed", deductionAmountPence: 45000, checkoutOffset: -15 },
  { propertyId: "p-greek-st", status: "deduction_proposed", deductionAmountPence: 18000, checkoutOffset: -12 },
  { propertyId: "p-paddington", status: "approved", deductionAmountPence: 0, checkoutOffset: -11 },
  { propertyId: "p-paddington", status: "approved", deductionAmountPence: 32000, checkoutOffset: -10 },
  { propertyId: "p-greek-st", status: "processed", deductionAmountPence: 0, checkoutOffset: -28 },
  { propertyId: "p-hay-hill", status: "auto_refunded", deductionAmountPence: null, checkoutOffset: -24 }
];

const VENDOR_SEEDS: VendorRow[] = [
  { id: "v1", name: "Soho Signage Co", trade: "signage", isApproved: true, totalJobs: 24, totalSpendPence: 1860000, qualityRating: 4.7 },
  { id: "v2", name: "Mayfair Blinds", trade: "blinds", isApproved: true, totalJobs: 11, totalSpendPence: 740000, qualityRating: 4.4 },
  { id: "v3", name: "West End Painters", trade: "painting", isApproved: true, totalJobs: 18, totalSpendPence: 1320000, qualityRating: 4.6 },
  { id: "v4", name: "Capital Plumbing", trade: "plumbing", isApproved: true, totalJobs: 9, totalSpendPence: 560000, qualityRating: 4.2 },
  { id: "v5", name: "BrightSpark Electrical", trade: "electrical", isApproved: true, totalJobs: 7, totalSpendPence: 480000, qualityRating: 4.5 },
  { id: "v6", name: "Pristine Cleaning", trade: "cleaning", isApproved: true, totalJobs: 52, totalSpendPence: 2340000, qualityRating: 4.8 },
  { id: "v7", name: "Guardian Security", trade: "security", isApproved: true, totalJobs: 6, totalSpendPence: 390000, qualityRating: 4.3 },
  { id: "v8", name: "Handy Fitzrovia", trade: "general", isApproved: false, totalJobs: 2, totalSpendPence: 120000, qualityRating: null }
];

export function generateMockAnalytics(now: Date = new Date()): AnalyticsData {
  const windowStart = londonToday(now);

  const enquiries: EnquiryRow[] = ENQUIRY_SEEDS.map((seed, i) => ({
    id: seed.id,
    brandOrTenantName: seed.brand,
    stage: seed.stage,
    valuePence: seed.valuePence,
    propertyName: seed.propertyId ? PROPERTY_NAME.get(seed.propertyId) ?? null : null,
    updatedAt: `${addDaysIso(windowStart, -i)}T09:00:00Z`
  }));

  const bookings: BookingRow[] = BOOKING_SEEDS.map((seed) => ({
    id: seed.id,
    externalId: seed.externalId,
    brandName: seed.brand,
    propertyName: PROPERTY_NAME.get(seed.propertyId) ?? null,
    checkInDate: addDaysIso(windowStart, seed.startOffset),
    checkOutDate: addDaysIso(windowStart, seed.startOffset + seed.durationDays),
    ttvPence: seed.ttvPence,
    status: seed.status
  }));

  const shifts: ShiftRow[] = SHIFT_SEEDS.map((seed) => ({
    id: seed.id,
    type: seed.type,
    status: seed.status,
    date: addDaysIso(windowStart, seed.dayOffset),
    propertyName: PROPERTY_NAME.get(seed.propertyId) ?? null,
    assigned: seed.status === "assigned" || seed.status === "completed"
  }));

  const properties: PropertyRow[] = DEMO_PROPERTIES.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    status: p.status,
    address: p.address
  }));

  const vendors: VendorRow[] = VENDOR_SEEDS.map((v) => ({ ...v }));

  const openEnquiries = ENQUIRY_SEEDS.filter((e) => isOpenStage(e.stage));
  const metrics: HeadlineMetrics = {
    openPipelinePence: openEnquiries.reduce((sum, e) => sum + (e.valuePence ?? 0), 0),
    openEnquiries: openEnquiries.length,
    bookingsCount: bookings.length,
    totalTtvPence: bookings.reduce((sum, b) => sum + b.ttvPence, 0),
    shiftsCompleted: shifts.filter((s) => s.status === "completed").length,
    shiftsOpen: shifts.filter((s) => s.status === "open" || s.status === "applied").length,
    vendorCount: vendors.length,
    approvedVendorCount: vendors.filter((v) => v.isApproved).length
  };

  const funnel = buildFunnel(ENQUIRY_SEEDS.map((e) => e.stage));

  const occupancy = buildOccupancy(
    DEMO_PROPERTIES.map((p) => ({ id: p.id, name: p.name, tier: p.tier })),
    BOOKING_SEEDS.map((b) => ({
      propertyId: b.propertyId,
      checkInDate: addDaysIso(windowStart, b.startOffset),
      checkOutDate: addDaysIso(windowStart, b.startOffset + b.durationDays)
    })),
    windowStart,
    OCCUPANCY_WINDOW_DAYS
  );

  const deposits = buildDepositsAnalytics(
    DEMO_PROPERTIES.map((p) => ({ id: p.id, name: p.name })),
    DEPOSIT_SEEDS.map((d) => ({
      propertyId: d.propertyId,
      status: d.status,
      deductionAmountPence: d.deductionAmountPence,
      checkoutDate: addDaysIso(windowStart, d.checkoutOffset)
    })),
    windowStart
  );

  return {
    metrics,
    funnel,
    occupancy,
    enquiries,
    bookings,
    shifts,
    vendors,
    properties,
    deposits,
    windowStart,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
