// Deterministic demo calendar for mock/preview mode. Dates are relative to today
// so the month grid feels current. Every event kind appears across the next few
// weeks and across several properties, plus a couple of unscheduled maintenance
// jobs for the panel.

import { addDaysIso, londonToday } from "@/lib/utils";
import type {
  CalendarData,
  CalendarEvent,
  MaintenanceItem,
  PropertyOption
} from "./types";

const DEMO_PROPERTIES: PropertyOption[] = [
  { id: "p-greek-st", name: "Greek St" },
  { id: "p-darblay", name: "D'arblay" },
  { id: "p-hay-hill", name: "Hay Hill" },
  { id: "p-paddington", name: "Paddington" },
  { id: "p-eastcastle", name: "Eastcastle" }
];

const NAME_BY_ID = new Map(DEMO_PROPERTIES.map((p) => [p.id, p.name]));

type EventSeed = {
  kind: CalendarEvent["kind"];
  offset: number;            // days from today
  propertyId: string;
  title: string;
  time: string | null;
  trade?: CalendarEvent["trade"];
  maintenanceStatus?: CalendarEvent["maintenanceStatus"];
  cleanType?: CalendarEvent["cleanType"];
};

// Spread across roughly the next four weeks plus a couple in the recent past so
// the previous month also has content.
const EVENT_SEEDS: EventSeed[] = [
  // Check-ins / pre-cleans (arrivals)
  { kind: "clean", offset: 1, propertyId: "p-greek-st", title: "Pre-clean", time: "08:00-09:00", cleanType: "pre_clean" },
  { kind: "check_in", offset: 1, propertyId: "p-greek-st", title: "Reformation", time: "08:45" },
  { kind: "check_in", offset: 4, propertyId: "p-paddington", title: "Allbirds", time: "08:45" },
  { kind: "clean", offset: 4, propertyId: "p-paddington", title: "Pre-clean", time: "08:00-09:00", cleanType: "pre_clean" },
  { kind: "check_in", offset: 9, propertyId: "p-darblay", title: "Aesop", time: "08:45" },
  { kind: "clean", offset: 9, propertyId: "p-darblay", title: "Pre-clean", time: "08:00-09:00", cleanType: "pre_clean" },
  { kind: "check_in", offset: 16, propertyId: "p-eastcastle", title: "Glossier", time: "08:45" },

  // Check-outs / post-cleans (departures)
  { kind: "check_out", offset: 2, propertyId: "p-hay-hill", title: "Diptyque", time: "16:45" },
  { kind: "clean", offset: 2, propertyId: "p-hay-hill", title: "Post-clean", time: "17:00 onwards", cleanType: "post_clean" },
  { kind: "check_out", offset: 6, propertyId: "p-greek-st", title: "Ganni", time: "16:45" },
  { kind: "clean", offset: 6, propertyId: "p-greek-st", title: "Post-clean", time: "17:00 onwards", cleanType: "post_clean" },
  { kind: "check_out", offset: 13, propertyId: "p-darblay", title: "Lemaire", time: "16:45" },
  { kind: "clean", offset: 13, propertyId: "p-darblay", title: "Post-clean", time: "17:00 onwards", cleanType: "post_clean" },

  // Viewings
  { kind: "viewing", offset: 3, propertyId: "p-hay-hill", title: "Polaroid", time: "14:00" },
  { kind: "viewing", offset: 7, propertyId: "p-greek-st", title: "Skims", time: "11:30" },
  { kind: "viewing", offset: 11, propertyId: "p-darblay", title: "Lemaire", time: "10:00" },
  { kind: "viewing", offset: 18, propertyId: "p-eastcastle", title: "Mejuri", time: "15:00" },

  // Deep clean
  { kind: "clean", offset: 8, propertyId: "p-paddington", title: "Deep clean", time: "09:00-13:00", cleanType: "deep_clean" },

  // Scheduled maintenance (these double as calendar events)
  { kind: "maintenance", offset: 2, propertyId: "p-greek-st", title: "Repaint scuffed wall", time: "10:00", trade: "painting", maintenanceStatus: "scheduled" },
  { kind: "maintenance", offset: 5, propertyId: "p-hay-hill", title: "Replace blown downlight", time: null, trade: "electrical", maintenanceStatus: "in_progress" },
  { kind: "maintenance", offset: 12, propertyId: "p-paddington", title: "Service window blinds", time: "13:00", trade: "blinds", maintenanceStatus: "scheduled" },

  // A little recent-past content for the previous month
  { kind: "check_out", offset: -5, propertyId: "p-eastcastle", title: "Oatly", time: "16:45" },
  { kind: "clean", offset: -5, propertyId: "p-eastcastle", title: "Post-clean", time: "17:00 onwards", cleanType: "post_clean" },
  { kind: "viewing", offset: -8, propertyId: "p-hay-hill", title: "Cuyana", time: "12:00" }
];

type MaintenanceSeed = {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  trade: MaintenanceItem["trade"];
  status: MaintenanceItem["status"];
  scheduledOffset: number | null;
  completedOffset?: number | null;
};

const MAINTENANCE_SEEDS: MaintenanceSeed[] = [
  { id: "m1", propertyId: "p-greek-st", title: "Repaint scuffed wall", description: "Hallway scuff flagged on last check-out report.", trade: "painting", status: "scheduled", scheduledOffset: 2 },
  { id: "m2", propertyId: "p-hay-hill", title: "Replace blown downlight", description: "Rear ceiling spot out.", trade: "electrical", status: "in_progress", scheduledOffset: 5 },
  { id: "m3", propertyId: "p-paddington", title: "Service window blinds", description: "Front blinds sticking.", trade: "blinds", status: "scheduled", scheduledOffset: 12 },
  // Unscheduled (panel only, no calendar chip)
  { id: "m4", propertyId: "p-darblay", title: "Re-grout bathroom tiles", description: "Grout cracking near basin.", trade: "general", status: "unscheduled", scheduledOffset: null },
  { id: "m5", propertyId: "p-eastcastle", title: "Fix dripping tap", description: "Kitchenette mixer drips overnight.", trade: "plumbing", status: "unscheduled", scheduledOffset: null },
  // Completed
  { id: "m6", propertyId: "p-greek-st", title: "Replace door signage", description: "Vinyl peeling at entrance.", trade: "signage", status: "completed", scheduledOffset: -6, completedOffset: -4 }
];

export function generateMockCalendar(now: Date = new Date()): CalendarData {
  const todayIso = londonToday(now);

  const events: CalendarEvent[] = EVENT_SEEDS.map((s, i) => ({
    id: `mock-ev-${i}`,
    kind: s.kind,
    date: addDaysIso(todayIso, s.offset),
    propertyId: s.propertyId,
    propertyName: NAME_BY_ID.get(s.propertyId) ?? null,
    title: s.title,
    time: s.time,
    trade: s.trade ?? null,
    maintenanceStatus: s.maintenanceStatus ?? null,
    cleanType: s.cleanType ?? null
  }));

  const maintenance: MaintenanceItem[] = MAINTENANCE_SEEDS.map((s) => ({
    id: s.id,
    propertyId: s.propertyId,
    propertyName: NAME_BY_ID.get(s.propertyId) ?? null,
    title: s.title,
    description: s.description,
    trade: s.trade,
    status: s.status,
    scheduledDate: s.scheduledOffset === null ? null : addDaysIso(todayIso, s.scheduledOffset),
    completedAt:
      s.completedOffset === null || s.completedOffset === undefined
        ? null
        : `${addDaysIso(todayIso, s.completedOffset)}T15:00:00Z`,
    createdAt: `${addDaysIso(todayIso, -10)}T09:00:00Z`
  }));

  return {
    events,
    maintenance,
    properties: DEMO_PROPERTIES,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
