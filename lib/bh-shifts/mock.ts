// Deterministic demo data for the brand host shift views in mock/preview mode.
// Dates are relative to today so the schedule feels current; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { sortBySchedule } from "./status";
import type {
  MarketplaceData,
  MyShiftItem,
  MyShiftsData,
  OpenShiftItem,
  ShiftType
} from "./types";

type DemoProperty = { id: string; name: string; keynest: string | null };

const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: "p-greek-st",
    name: "Greek St",
    keynest:
      "KeyNest at Caffe Nero, 43 Frith St (2 min walk). Quote the booking reference at the counter. Two key sets: pull the tagged 'FRONT + SHUTTER' set."
  },
  {
    id: "p-darblay",
    name: "D'arblay",
    keynest:
      "KeyNest at The Newsagent, 12 D'Arblay St (next door). One set only: front door plus alarm fob. Alarm panel is behind the till area, code in the space guide."
  },
  {
    id: "p-hay-hill",
    name: "Hay Hill",
    keynest:
      "KeyNest at Pret, 8 Berkeley St (4 min walk). Single key opens the front; the shutter switch is inside on the left."
  },
  {
    id: "p-paddington",
    name: "Paddington",
    keynest:
      "KeyNest at Sainsbury's Local, 5 Paddington St. Two sets stored: take 'GROUND' for check ins. Backup set held by the landlord if the store is shut."
  }
];

// Standard windows: check in 09:00, check out 17:00, viewings mid afternoon.
const WINDOW: Record<ShiftType, { start: string; end: string }> = {
  check_in: { start: "09:00:00", end: "11:00:00" },
  check_out: { start: "17:00:00", end: "19:00:00" },
  viewing: { start: "14:00:00", end: "15:00:00" }
};

type Seed = {
  id: string;
  dayOffset: number;
  propertyId: string;
  type: ShiftType;
  brand: string | null;
  ratePence: number;
  isEscalated: boolean;
  // "open"  -> shows in the marketplace
  // "applied" -> shows in the marketplace as already applied for
  // "mine"  -> assigned to this brand host, shows in My shifts
  bucket: "open" | "applied" | "mine";
};

const SEEDS: Seed[] = [
  { id: "bh-s1", dayOffset: 0, propertyId: "p-greek-st", type: "check_in", brand: "Glossier", ratePence: 4500, isEscalated: false, bucket: "mine" },
  { id: "bh-s2", dayOffset: 0, propertyId: "p-darblay", type: "check_out", brand: "Aesop", ratePence: 4500, isEscalated: true, bucket: "open" },
  { id: "bh-s3", dayOffset: 1, propertyId: "p-hay-hill", type: "viewing", brand: "Ganni", ratePence: 3000, isEscalated: false, bucket: "applied" },
  { id: "bh-s4", dayOffset: 2, propertyId: "p-paddington", type: "check_in", brand: "Reformation", ratePence: 5000, isEscalated: false, bucket: "open" },
  { id: "bh-s5", dayOffset: 2, propertyId: "p-greek-st", type: "check_out", brand: "Allbirds", ratePence: 4500, isEscalated: false, bucket: "mine" },
  { id: "bh-s6", dayOffset: 4, propertyId: "p-darblay", type: "viewing", brand: "Mejuri", ratePence: 3000, isEscalated: false, bucket: "open" },
  { id: "bh-s7", dayOffset: 5, propertyId: "p-hay-hill", type: "check_in", brand: "Polaroid", ratePence: 5000, isEscalated: false, bucket: "mine" },
  { id: "bh-s8", dayOffset: 6, propertyId: "p-paddington", type: "check_out", brand: "Reformation", ratePence: 4500, isEscalated: false, bucket: "open" },
  { id: "bh-s9", dayOffset: 8, propertyId: "p-greek-st", type: "viewing", brand: "Skims", ratePence: 3500, isEscalated: false, bucket: "applied" },
  { id: "bh-s10", dayOffset: 9, propertyId: "p-darblay", type: "check_in", brand: "Lemaire", ratePence: 4500, isEscalated: false, bucket: "open" },
  { id: "bh-s11", dayOffset: 11, propertyId: "p-hay-hill", type: "check_out", brand: "Ganni", ratePence: 4500, isEscalated: false, bucket: "mine" },
  { id: "bh-s12", dayOffset: 13, propertyId: "p-paddington", type: "check_in", brand: "Oatly", ratePence: 5000, isEscalated: false, bucket: "open" }
];

function propertyFor(id: string): DemoProperty | undefined {
  return DEMO_PROPERTIES.find((p) => p.id === id);
}

export function generateMockMarketplace(now: Date = new Date()): MarketplaceData {
  const todayIso = londonToday(now);
  const items: OpenShiftItem[] = SEEDS.filter((s) => s.bucket === "open" || s.bucket === "applied").map(
    (seed) => {
      const win = WINDOW[seed.type];
      const property = propertyFor(seed.propertyId);
      return {
        id: seed.id,
        date: addDaysIso(todayIso, seed.dayOffset),
        startTime: win.start,
        endTime: win.end,
        propertyId: seed.propertyId,
        propertyName: property?.name ?? null,
        type: seed.type,
        brand: seed.brand,
        ratePence: seed.ratePence,
        isEscalated: seed.isEscalated,
        hasApplied: seed.bucket === "applied"
      };
    }
  );

  const sorted = sortBySchedule(items);

  return {
    shifts: sorted,
    appliedCount: sorted.filter((it) => it.hasApplied).length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}

export function generateMockMyShifts(now: Date = new Date()): MyShiftsData {
  const todayIso = londonToday(now);
  const items: MyShiftItem[] = SEEDS.filter((s) => s.bucket === "mine").map((seed) => {
    const win = WINDOW[seed.type];
    const property = propertyFor(seed.propertyId);
    return {
      id: seed.id,
      date: addDaysIso(todayIso, seed.dayOffset),
      startTime: win.start,
      endTime: win.end,
      propertyId: seed.propertyId,
      propertyName: property?.name ?? null,
      type: seed.type,
      brand: seed.brand,
      ratePence: seed.ratePence,
      isEscalated: seed.isEscalated,
      keynestInstructions: property?.keynest ?? null
    };
  });

  const sorted = sortBySchedule(items);

  return {
    shifts: sorted,
    upcomingCount: sorted.length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
