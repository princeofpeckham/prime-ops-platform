// Deterministic demo cleaning jobs for the cleaner portal in mock/preview
// mode. Dates are relative to today so the schedule feels current. KeyNest
// instructions describe the collection point only, never a real key code.

import { addDaysIso, londonToday } from "@/lib/utils";
import type {
  CleaningJobStatus,
  CleaningJobType,
  CleanerHistoryData,
  CleanerJobItem,
  CleanerJobsData
} from "./types";

type Seed = {
  id: string;
  brand: string;
  property: string;
  address: string;
  keynest: string;
  dateOffset: number;          // days from today
  timeWindow: string | null;
  type: CleaningJobType;
  ratePence: number;
  status: CleaningJobStatus;
  notes: string | null;
  photoCount: number;          // demo completion photos for finished jobs
};

const SEEDS: Seed[] = [
  // Upcoming: pending / dispatched / confirmed
  { id: "c1", brand: "Glossier", property: "Greek St", address: "12 Greek St, Soho", keynest: "KeyNest at Bar Italia, 22 Frith St. Open 7am to 9pm. Ask at the till, quote the space name.", dateOffset: 0, timeWindow: "After 17:00", type: "post_clean", ratePence: 9000, status: "dispatched", notes: "FnB deep clean, brand ran a coffee bar. Degrease the back counter.", photoCount: 0 },
  { id: "c2", brand: "Aesop", property: "D'arblay", address: "8 D'arblay St, Soho", keynest: "KeyNest at the newsagent, 14 D'arblay St. Open 6am to 8pm.", dateOffset: 1, timeWindow: "09:00 to 12:00", type: "post_clean", ratePence: 8500, status: "confirmed", notes: null, photoCount: 0 },
  { id: "c3", brand: "Ganni", property: "Hay Hill", address: "5 Hay Hill, Mayfair", keynest: "KeyNest at Caffe Nero, 27 Berkeley St. Open 6:30am to 7pm.", dateOffset: 2, timeWindow: "Any time, space vacant", type: "post_clean", ratePence: 12000, status: "dispatched", notes: "Deep floor scrub, marble needs the soft pads only.", photoCount: 0 },
  { id: "c4", brand: "Reformation", property: "Paddington", address: "2 Paddington Central, W2", keynest: "KeyNest at the Sheldon Square reception desk. Open 8am to 6pm, weekdays only.", dateOffset: 3, timeWindow: "After 17:00", type: "post_clean", ratePence: 9500, status: "pending", notes: null, photoCount: 0 },
  { id: "c5", brand: "Glossier", property: "Greek St", address: "12 Greek St, Soho", keynest: "KeyNest at Bar Italia, 22 Frith St. Open 7am to 9pm. Ask at the till, quote the space name.", dateOffset: 5, timeWindow: "09:00 to 11:00", type: "pre_clean", ratePence: 7000, status: "pending", notes: "Pre check in touch up before the next brand arrives.", photoCount: 0 },
  { id: "c6", brand: "Aesop", property: "Hay Hill", address: "5 Hay Hill, Mayfair", keynest: "KeyNest at Caffe Nero, 27 Berkeley St. Open 6:30am to 7pm.", dateOffset: 7, timeWindow: "Any time, space vacant", type: "deep_clean", ratePence: 14000, status: "pending", notes: "Full deep clean between residencies.", photoCount: 0 },

  // History: completed
  { id: "c7", brand: "Reformation", property: "D'arblay", address: "8 D'arblay St, Soho", keynest: "KeyNest at the newsagent, 14 D'arblay St. Open 6am to 8pm.", dateOffset: -2, timeWindow: "After 17:00", type: "post_clean", ratePence: 8500, status: "completed", notes: null, photoCount: 3 },
  { id: "c8", brand: "Ganni", property: "Greek St", address: "12 Greek St, Soho", keynest: "KeyNest at Bar Italia, 22 Frith St. Open 7am to 9pm.", dateOffset: -4, timeWindow: "09:00 to 12:00", type: "post_clean", ratePence: 9000, status: "completed", notes: "Coffee brand, FnB deep clean done.", photoCount: 4 },
  { id: "c9", brand: "Glossier", property: "Paddington", address: "2 Paddington Central, W2", keynest: "KeyNest at the Sheldon Square reception desk. Open 8am to 6pm.", dateOffset: -6, timeWindow: "Any time, space vacant", type: "post_clean", ratePence: 9500, status: "completed", notes: null, photoCount: 2 },
  { id: "c10", brand: "Aesop", property: "Hay Hill", address: "5 Hay Hill, Mayfair", keynest: "KeyNest at Caffe Nero, 27 Berkeley St. Open 6:30am to 7pm.", dateOffset: -9, timeWindow: "After 17:00", type: "deep_clean", ratePence: 14000, status: "completed", notes: "Deep clean between residencies.", photoCount: 5 },
  { id: "c11", brand: "Reformation", property: "Greek St", address: "12 Greek St, Soho", keynest: "KeyNest at Bar Italia, 22 Frith St. Open 7am to 9pm.", dateOffset: -12, timeWindow: "09:00 to 11:00", type: "pre_clean", ratePence: 7000, status: "completed", notes: null, photoCount: 2 },
  { id: "c12", brand: "Ganni", property: "D'arblay", address: "8 D'arblay St, Soho", keynest: "KeyNest at the newsagent, 14 D'arblay St. Open 6am to 8pm.", dateOffset: -15, timeWindow: "After 17:00", type: "post_clean", ratePence: 8500, status: "completed", notes: null, photoCount: 3 }
];

function buildItem(seed: Seed, todayIso: string): CleanerJobItem {
  const date = addDaysIso(todayIso, seed.dateOffset);
  const completedAt = seed.status === "completed" ? `${date}T19:30:00.000Z` : null;
  const confirmedAt =
    seed.status === "confirmed" || seed.status === "completed" ? `${date}T08:00:00.000Z` : null;
  return {
    id: seed.id,
    date,
    timeWindow: seed.timeWindow,
    propertyId: `p-${seed.id}`,
    propertyName: seed.property,
    propertyAddress: seed.address,
    keynestInstructions: seed.keynest,
    brandName: seed.brand,
    type: seed.type,
    ratePence: seed.ratePence,
    status: seed.status,
    notes: seed.notes,
    confirmedAt,
    completedAt,
    completionPhotos: Array.from(
      { length: seed.photoCount },
      (_, i) => `mock/${seed.id}/photo-${i + 1}.jpg`
    )
  };
}

export function generateMockCleanerJobs(now: Date = new Date()): CleanerJobsData {
  const todayIso = londonToday(now);
  const items = SEEDS.filter((s) => s.status !== "completed" && s.status !== "cancelled")
    .map((s) => buildItem(s, todayIso))
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    jobs: items,
    toConfirmCount: items.filter((it) => it.status === "dispatched").length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}

export function generateMockCleanerHistory(now: Date = new Date()): CleanerHistoryData {
  const todayIso = londonToday(now);
  const items = SEEDS.filter((s) => s.status === "completed")
    .map((s) => buildItem(s, todayIso))
    .sort((a, b) => b.date.localeCompare(a.date));
  return {
    jobs: items,
    totalEarnedPence: items.reduce((sum, it) => sum + it.ratePence, 0),
    completedCount: items.length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
