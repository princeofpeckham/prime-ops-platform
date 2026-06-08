// Deterministic demo vendors and jobs for mock/preview mode.
// Job due dates are relative to today so cards feel current; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { toColumns } from "./status";
import type {
  PropertyOption,
  TradeType,
  VendorItem,
  VendorJobItem,
  VendorJobStatus,
  VendorsData
} from "./types";

const DEMO_PROPERTIES: PropertyOption[] = [
  { id: "p-greek-st", name: "Greek St" },
  { id: "p-darblay", name: "D'arblay" },
  { id: "p-hay-hill", name: "Hay Hill" },
  { id: "p-paddington", name: "Paddington" },
  { id: "p-eastcastle", name: "Eastcastle" }
];

type VendorSeed = {
  id: string;
  name: string;
  trade: TradeType;
  qualityRating: number | null;
  isApproved: boolean;
  totalJobs: number;
  coverageArea: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

const VENDOR_SEEDS: VendorSeed[] = [
  { id: "v1", name: "Soho Sign Co", trade: "signage", qualityRating: 5, isApproved: true, totalJobs: 34, coverageArea: "Central London", contactName: "Tom Reed", contactEmail: "tom@sohosign.co.uk", contactPhone: "020 7123 0001" },
  { id: "v2", name: "Blind Ambition", trade: "blinds", qualityRating: 4, isApproved: true, totalJobs: 21, coverageArea: "London Zone 1 and 2", contactName: "Priya Shah", contactEmail: "hello@blindambition.uk", contactPhone: "020 7123 0002" },
  { id: "v3", name: "West End Painters", trade: "painting", qualityRating: 5, isApproved: true, totalJobs: 48, coverageArea: "West End", contactName: "Liam Doyle", contactEmail: "bookings@westendpainters.co.uk", contactPhone: "020 7123 0003" },
  { id: "v4", name: "Mayfair Plumbing", trade: "plumbing", qualityRating: 4, isApproved: true, totalJobs: 17, coverageArea: "Mayfair and Soho", contactName: "Grace Owens", contactEmail: "ops@mayfairplumbing.co.uk", contactPhone: "020 7123 0004" },
  { id: "v5", name: "Voltify Electrical", trade: "electrical", qualityRating: 5, isApproved: true, totalJobs: 29, coverageArea: "Greater London", contactName: "Sam Patel", contactEmail: "jobs@voltify.co.uk", contactPhone: "020 7123 0005" },
  { id: "v6", name: "Spotless Retail Clean", trade: "cleaning", qualityRating: 4, isApproved: true, totalJobs: 62, coverageArea: "Central London", contactName: "Maria Costa", contactEmail: "team@spotlessretail.co.uk", contactPhone: "020 7123 0006" },
  { id: "v7", name: "Guardline Security", trade: "security", qualityRating: 3, isApproved: true, totalJobs: 11, coverageArea: "London wide", contactName: "Dwayne Clarke", contactEmail: "control@guardline.uk", contactPhone: "020 7123 0007" },
  { id: "v8", name: "Fitzrovia Handyman", trade: "general", qualityRating: 4, isApproved: true, totalJobs: 40, coverageArea: "Fitzrovia and Soho", contactName: "Ben Harris", contactEmail: "ben@fitzhandyman.co.uk", contactPhone: "020 7123 0008" },
  { id: "v9", name: "Lumen Signage Studio", trade: "signage", qualityRating: 4, isApproved: false, totalJobs: 3, coverageArea: "East London", contactName: "Nadia Khan", contactEmail: "studio@lumensignage.co.uk", contactPhone: "020 7123 0009" },
  { id: "v10", name: "Brushstroke Decor", trade: "painting", qualityRating: null, isApproved: false, totalJobs: 0, coverageArea: "North London", contactName: "Oscar Lind", contactEmail: "hello@brushstrokedecor.uk", contactPhone: null },
  { id: "v11", name: "Capital Locks", trade: "security", qualityRating: 5, isApproved: true, totalJobs: 19, coverageArea: "Central and West London", contactName: "Erin Walsh", contactEmail: "callout@capitallocks.co.uk", contactPhone: "020 7123 0011" },
  { id: "v12", name: "Shade and Co", trade: "blinds", qualityRating: null, isApproved: false, totalJobs: 1, coverageArea: "South London", contactName: "Felix Moore", contactEmail: "quotes@shadeandco.uk", contactPhone: null }
];

type JobSeed = {
  id: string;
  title: string;
  trade: TradeType;
  status: VendorJobStatus;
  propertyId: string;
  vendorId: string | null;
  quotePence: number | null;
  actualPence: number | null;
  dueOffset: number | null;
  chaseCount: number;
};

const JOB_SEEDS: JobSeed[] = [
  { id: "j1", title: "Glossier window vinyl install", trade: "signage", status: "draft", propertyId: "p-greek-st", vendorId: null, quotePence: null, actualPence: null, dueOffset: 12, chaseCount: 0 },
  { id: "j2", title: "Aesop fascia repaint", trade: "painting", status: "quoted", propertyId: "p-darblay", vendorId: "v3", quotePence: 145000, actualPence: null, dueOffset: 9, chaseCount: 1 },
  { id: "j3", title: "Ganni roller blinds replacement", trade: "blinds", status: "approved", propertyId: "p-greek-st", vendorId: "v2", quotePence: 88000, actualPence: null, dueOffset: 6, chaseCount: 0 },
  { id: "j4", title: "Reformation lighting rig install", trade: "electrical", status: "scheduled", propertyId: "p-eastcastle", vendorId: "v5", quotePence: 230000, actualPence: null, dueOffset: 3, chaseCount: 0 },
  { id: "j5", title: "Allbirds leak in back office", trade: "plumbing", status: "in_progress", propertyId: "p-paddington", vendorId: "v4", quotePence: 60000, actualPence: null, dueOffset: 1, chaseCount: 2 },
  { id: "j6", title: "Hay Hill deep clean before handover", trade: "cleaning", status: "completed", propertyId: "p-hay-hill", vendorId: "v6", quotePence: 42000, actualPence: 42000, dueOffset: -2, chaseCount: 0 },
  { id: "j7", title: "Greek St alarm fault callout", trade: "security", status: "disputed", propertyId: "p-greek-st", vendorId: "v7", quotePence: 35000, actualPence: 58000, dueOffset: -5, chaseCount: 3 },
  { id: "j8", title: "D'arblay shelving and snagging", trade: "general", status: "quoted", propertyId: "p-darblay", vendorId: "v8", quotePence: 52000, actualPence: null, dueOffset: 15, chaseCount: 0 }
];

function buildVendor(seed: VendorSeed): VendorItem {
  return {
    id: seed.id,
    name: seed.name,
    trade: seed.trade,
    qualityRating: seed.qualityRating,
    isApproved: seed.isApproved,
    totalJobs: seed.totalJobs,
    coverageArea: seed.coverageArea,
    contactName: seed.contactName,
    contactEmail: seed.contactEmail,
    contactPhone: seed.contactPhone
  };
}

function buildJob(seed: JobSeed, todayIso: string): VendorJobItem {
  const vendorName = seed.vendorId
    ? VENDOR_SEEDS.find((v) => v.id === seed.vendorId)?.name ?? null
    : null;
  const propertyName = DEMO_PROPERTIES.find((p) => p.id === seed.propertyId)?.name ?? null;
  return {
    id: seed.id,
    title: seed.title,
    trade: seed.trade,
    status: seed.status,
    propertyId: seed.propertyId,
    propertyName,
    vendorId: seed.vendorId,
    vendorName,
    quoteAmountPence: seed.quotePence,
    actualAmountPence: seed.actualPence,
    dueDate: seed.dueOffset === null ? null : addDaysIso(todayIso, seed.dueOffset),
    chaseCount: seed.chaseCount
  };
}

export function generateMockVendors(now: Date = new Date()): VendorsData {
  const todayIso = londonToday(now);
  const vendors = VENDOR_SEEDS.map(buildVendor);
  const jobs = JOB_SEEDS.map((s) => buildJob(s, todayIso));
  return {
    vendors,
    columns: toColumns(jobs),
    properties: DEMO_PROPERTIES,
    approvedCount: vendors.filter((v) => v.isApproved).length,
    openJobCount: jobs.filter((j) => j.status !== "completed").length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
