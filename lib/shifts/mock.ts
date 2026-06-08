// Deterministic demo shifts for the rota in mock/preview mode.
// Dates are relative to today so the schedule feels current; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { sortShifts } from "./status";
import type { PropertyOption, ShiftItem, ShiftsData } from "./types";

const DEMO_PROPERTIES: PropertyOption[] = [
  { id: "p-greek-st", name: "Greek St" },
  { id: "p-darblay", name: "D'arblay" },
  { id: "p-hay-hill", name: "Hay Hill" },
  { id: "p-paddington", name: "Paddington" }
];

// Standard windows: check in 09:00, check out 17:00, viewings mid afternoon.
const WINDOW: Record<ShiftItem["type"], { start: string; end: string }> = {
  check_in: { start: "09:00:00", end: "11:00:00" },
  check_out: { start: "17:00:00", end: "19:00:00" },
  viewing: { start: "14:00:00", end: "15:00:00" }
};

type Seed = {
  id: string;
  dayOffset: number;
  propertyId: string;
  type: ShiftItem["type"];
  brand: string | null;
  ratePence: number;
  status: ShiftItem["status"];
  assignedBhId: string | null;
  isEscalated: boolean;
};

const SEEDS: Seed[] = [
  { id: "s1", dayOffset: 0, propertyId: "p-greek-st", type: "check_in", brand: "Glossier", ratePence: 4500, status: "assigned", assignedBhId: "bh-amara", isEscalated: false },
  { id: "s2", dayOffset: 0, propertyId: "p-darblay", type: "check_out", brand: "Aesop", ratePence: 4500, status: "open", assignedBhId: null, isEscalated: true },
  { id: "s3", dayOffset: 1, propertyId: "p-hay-hill", type: "viewing", brand: "Ganni", ratePence: 3000, status: "assigned", assignedBhId: "bh-tom", isEscalated: false },
  { id: "s4", dayOffset: 2, propertyId: "p-paddington", type: "check_in", brand: "Reformation", ratePence: 5000, status: "open", assignedBhId: null, isEscalated: false },
  { id: "s5", dayOffset: 3, propertyId: "p-greek-st", type: "check_out", brand: "Allbirds", ratePence: 4500, status: "applied", assignedBhId: null, isEscalated: false },
  { id: "s6", dayOffset: 4, propertyId: "p-darblay", type: "viewing", brand: "Mejuri", ratePence: 3000, status: "open", assignedBhId: null, isEscalated: false },
  { id: "s7", dayOffset: 5, propertyId: "p-hay-hill", type: "check_in", brand: "Polaroid", ratePence: 5000, status: "assigned", assignedBhId: "bh-amara", isEscalated: false },
  { id: "s8", dayOffset: 6, propertyId: "p-paddington", type: "check_out", brand: "Reformation", ratePence: 4500, status: "open", assignedBhId: null, isEscalated: false },
  { id: "s9", dayOffset: 8, propertyId: "p-greek-st", type: "viewing", brand: "Skims", ratePence: 3500, status: "assigned", assignedBhId: "bh-tom", isEscalated: false },
  { id: "s10", dayOffset: 9, propertyId: "p-darblay", type: "check_in", brand: "Lemaire", ratePence: 4500, status: "open", assignedBhId: null, isEscalated: false },
  { id: "s11", dayOffset: 11, propertyId: "p-hay-hill", type: "check_out", brand: "Ganni", ratePence: 4500, status: "assigned", assignedBhId: "bh-amara", isEscalated: false },
  { id: "s12", dayOffset: 13, propertyId: "p-paddington", type: "check_in", brand: "Oatly", ratePence: 5000, status: "open", assignedBhId: null, isEscalated: false }
];

function buildItem(seed: Seed, todayIso: string): ShiftItem {
  const win = WINDOW[seed.type];
  const propertyName = DEMO_PROPERTIES.find((p) => p.id === seed.propertyId)?.name ?? null;
  return {
    id: seed.id,
    date: addDaysIso(todayIso, seed.dayOffset),
    startTime: win.start,
    endTime: win.end,
    propertyId: seed.propertyId,
    propertyName,
    type: seed.type,
    brand: seed.brand,
    ratePence: seed.ratePence,
    status: seed.status,
    assignedBhId: seed.assignedBhId,
    isAssigned: seed.assignedBhId != null,
    isEscalated: seed.isEscalated
  };
}

export function generateMockShifts(now: Date = new Date()): ShiftsData {
  const todayIso = londonToday(now);
  const items = sortShifts(SEEDS.map((s) => buildItem(s, todayIso)));
  return {
    shifts: items,
    properties: DEMO_PROPERTIES,
    openCount: items.filter((it) => it.status === "open").length,
    escalatedCount: items.filter((it) => it.isEscalated).length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
