// Deterministic demo cleaning jobs for mock/preview mode.
// Dates are relative to today so the schedule feels current; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { buildData } from "./queries";
import type { CleaningData, CleaningJobItem } from "./types";

const PROPERTIES: { id: string; name: string }[] = [
  { id: "p-greek-st", name: "Greek St" },
  { id: "p-darblay", name: "D'arblay" },
  { id: "p-hay-hill", name: "Hay Hill" },
  { id: "p-paddington", name: "Paddington" }
];

type Seed = {
  id: string;
  dateOffset: number;
  timeWindow: string | null;
  propertyId: string;
  type: CleaningJobItem["type"];
  ratePence: number;
  status: CleaningJobItem["status"];
  smsOffset: number | null;       // days before today the dispatch SMS went out
  confirmedOffset: number | null; // days before today the cleaner confirmed
  completedOffset: number | null; // days before today the job was completed
  notes: string | null;
};

const SEEDS: Seed[] = [
  { id: "c1", dateOffset: -6, timeWindow: "08:00 to 12:00", propertyId: "p-greek-st", type: "post_clean", ratePence: 14000, status: "completed", smsOffset: -8, confirmedOffset: -8, completedOffset: -6, notes: "Glossier residency end of stay, full reset." },
  { id: "c2", dateOffset: -4, timeWindow: "09:00 to 11:00", propertyId: "p-hay-hill", type: "pre_clean", ratePence: 9000, status: "completed", smsOffset: -6, confirmedOffset: -6, completedOffset: -4, notes: "Pre arrival sparkle for Aesop." },
  { id: "c3", dateOffset: -2, timeWindow: "13:00 to 17:00", propertyId: "p-darblay", type: "deep_clean", ratePence: 22000, status: "completed", smsOffset: -4, confirmedOffset: -4, completedOffset: -2, notes: "Deep clean between tenants, floors resealed." },
  { id: "c4", dateOffset: 0, timeWindow: "07:00 to 09:00", propertyId: "p-paddington", type: "pre_clean", ratePence: 9500, status: "confirmed", smsOffset: -2, confirmedOffset: -1, completedOffset: null, notes: "Allbirds check in this morning, cleaner confirmed." },
  { id: "c5", dateOffset: 0, timeWindow: "17:00 to 19:00", propertyId: "p-greek-st", type: "post_clean", ratePence: 14000, status: "dispatched", smsOffset: -1, confirmedOffset: null, completedOffset: null, notes: "Ganni mid stay turnover, awaiting cleaner reply." },
  { id: "c6", dateOffset: 1, timeWindow: "08:00 to 10:00", propertyId: "p-hay-hill", type: "pre_clean", ratePence: 9000, status: "dispatched", smsOffset: 0, confirmedOffset: null, completedOffset: null, notes: "Reformation arrival prep." },
  { id: "c7", dateOffset: 1, timeWindow: null, propertyId: "p-darblay", type: "deep_clean", ratePence: 21000, status: "pending", smsOffset: null, confirmedOffset: null, completedOffset: null, notes: "Quarterly deep clean, time window to confirm." },
  { id: "c8", dateOffset: 2, timeWindow: "09:00 to 12:00", propertyId: "p-paddington", type: "post_clean", ratePence: 13500, status: "pending", smsOffset: null, confirmedOffset: null, completedOffset: null, notes: "End of Reformation pop up." },
  { id: "c9", dateOffset: 3, timeWindow: "07:00 to 09:00", propertyId: "p-greek-st", type: "pre_clean", ratePence: 9500, status: "pending", smsOffset: null, confirmedOffset: null, completedOffset: null, notes: "Skims flagship check in prep." },
  { id: "c10", dateOffset: 4, timeWindow: "13:00 to 16:00", propertyId: "p-hay-hill", type: "deep_clean", ratePence: 22500, status: "pending", smsOffset: null, confirmedOffset: null, completedOffset: null, notes: "Deep clean after Polaroid viewing week." },
  { id: "c11", dateOffset: 5, timeWindow: "08:00 to 11:00", propertyId: "p-darblay", type: "pre_clean", ratePence: 9000, status: "pending", smsOffset: null, confirmedOffset: null, completedOffset: null, notes: "Lemaire showroom set up." },
  { id: "c12", dateOffset: 1, timeWindow: "10:00 to 12:00", propertyId: "p-paddington", type: "post_clean", ratePence: 13500, status: "cancelled", smsOffset: -1, confirmedOffset: null, completedOffset: null, notes: "Tenant extended stay, turnover stood down." }
];

function offsetToIso(todayIso: string, offset: number | null): string | null {
  return offset === null ? null : `${addDaysIso(todayIso, offset)}T09:00:00Z`;
}

function buildItem(seed: Seed, todayIso: string): CleaningJobItem {
  const propertyName = PROPERTIES.find((p) => p.id === seed.propertyId)?.name ?? null;
  return {
    id: seed.id,
    date: addDaysIso(todayIso, seed.dateOffset),
    timeWindow: seed.timeWindow,
    propertyId: seed.propertyId,
    propertyName,
    type: seed.type,
    ratePence: seed.ratePence,
    status: seed.status,
    smsSentAt: offsetToIso(todayIso, seed.smsOffset),
    confirmedAt: offsetToIso(todayIso, seed.confirmedOffset),
    completedAt: offsetToIso(todayIso, seed.completedOffset),
    notes: seed.notes
  };
}

export function generateMockCleaning(now: Date = new Date()): CleaningData {
  const todayIso = londonToday(now);
  const items = SEEDS.map((s) => buildItem(s, todayIso)).sort((a, b) => a.date.localeCompare(b.date));
  return buildData(items, "mock", now);
}
