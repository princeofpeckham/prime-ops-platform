// Deterministic in-memory dashboard fixture. Same seed -> same output.
// Used when NEXT_PUBLIC_USE_MOCK_DATA=true. Drops away when Supabase data lands.

import {
  addDaysIso,
  isoDateRange,
  isoBetween,
  londonToday
} from "@/lib/utils";
import type {
  DashboardData,
  Property,
  PropertyHealth,
  RedFlags,
  TimelineCell,
  TimelineRow
} from "./types";

const NOW_ISO_DEFAULT = "1970-01-01T00:00:00Z";

const MOCK_PROPERTIES: Pick<Property, "id" | "name" | "address" | "postcode" | "tier" | "status">[] = [
  { id: "p-greek-st",            name: "Greek St",            address: "59 Greek St",          postcode: "W1D 3DZ",  tier: "prime", status: "active" },
  { id: "p-darblay",             name: "D'arblay",            address: "19 D'Arblay St",       postcode: "W1F 8DR",  tier: "prime", status: "active" },
  { id: "p-hay-hill",            name: "Hay Hill",            address: "14a Hay Hill",         postcode: "W1J 8NZ",  tier: "prime", status: "active" },
  { id: "p-paddington",          name: "Paddington",          address: "3 Paddington St",      postcode: "W1U 5QD",  tier: "prime", status: "active" },
  { id: "p-monmouth",            name: "Monmouth",            address: "6 Monmouth St",        postcode: "WC2H 9HB", tier: "prime", status: "fit_out" },
  { id: "p-retro-studio",        name: "Retro Studio",        address: "228 Brick Lane",       postcode: null,        tier: "other", status: "active" },
  { id: "p-corner-space",        name: "Corner Space",        address: "123 Bethnal Green Rd", postcode: null,        tier: "other", status: "active" },
  { id: "p-black-box",           name: "Black Box",           address: "3 Bateman St",         postcode: null,        tier: "other", status: "active" },
  { id: "p-black-brick",         name: "Black Brick Shop",    address: "11a Kingsland Rd",     postcode: null,        tier: "other", status: "active" },
  { id: "p-blue-vintage",        name: "Blue Vintage Shop",   address: "17b Kingsland Rd",     postcode: null,        tier: "other", status: "active" },
  { id: "p-raw-glass",           name: "Raw Glass Shop",      address: "259 Kingsland Rd",     postcode: null,        tier: "other", status: "active" },
  { id: "p-gallery",             name: "Gallery",             address: "15 Bateman St",        postcode: null,        tier: "other", status: "active" },
  { id: "p-portobello-331",      name: "Portobello 331",      address: "331 Portobello Rd",    postcode: null,        tier: "other", status: "active" },
  { id: "p-portobello-281",      name: "Portobello 281",      address: "281 Portobello Rd",    postcode: null,        tier: "other", status: "active" },
  { id: "p-eastcastle",          name: "Eastcastle",          address: "36 Eastcastle St",     postcode: null,        tier: "other", status: "active" },
  { id: "p-kensington-park-rd",  name: "Kensington Park Rd",  address: "19 Kensington Park Rd",postcode: null,        tier: "other", status: "active" },
  { id: "p-sidings-ground",      name: "Sidings Ground",      address: "The Sidings, Waterloo",postcode: null,        tier: "other", status: "active" },
  { id: "p-sidings-underground", name: "Sidings Underground", address: "The Sidings, Waterloo",postcode: null,        tier: "other", status: "active" }
];

const BRANDS = [
  "Glossier", "Aesop", "Hill House Home", "Polite Society", "Reformation",
  "Ganni", "Jacquemus", "Diptyque", "Acne Studios", "Sézane",
  "Cuyana", "Allbirds", "Patagonia", "Mara Hoffman", "Skims",
  "Maison Cleo", "Lemaire", "Toteme"
];

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashIso(iso: string): number {
  let h = 2166136261;
  for (let i = 0; i < iso.length; i++) {
    h ^= iso.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], r: number): T {
  const i = Math.min(Math.floor(r * arr.length), arr.length - 1);
  // length always >= 1 in our use, so non-null assertion is safe
  return arr[i] as T;
}

type MockBooking = {
  id: string;
  propertyId: string;
  brandName: string;
  checkInIso: string;
  checkOutIso: string;
  status: "confirmed" | "active" | "completed" | "cancelled";
};

type MockShift = {
  id: string;
  bookingId: string;
  propertyId: string;
  type: "check_in" | "check_out";
  dateIso: string;
  assigned: boolean;
};

type MockClean = {
  id: string;
  bookingId: string;
  propertyId: string;
  type: "pre_clean" | "post_clean";
  dateIso: string;
  confirmed: boolean;
};

function generateBookings(
  windowStart: string,
  windowDays: number,
  rng: () => number
): MockBooking[] {
  const out: MockBooking[] = [];
  let bookingCounter = 0;

  for (const prop of MOCK_PROPERTIES) {
    if (prop.status === "fit_out") continue;
    const utilization = prop.tier === "prime" ? 3 : 1.4;
    const target = Math.max(0, Math.round(utilization + rng() * 1.6 - 0.8));

    let cursor = -Math.floor(rng() * 4); // start can be a couple of days before window
    for (let i = 0; i < target; i++) {
      const duration = 2 + Math.floor(rng() * 6);
      const startOffset = cursor + Math.floor(rng() * 3);
      const endOffset = startOffset + duration;
      if (startOffset >= windowDays) break;
      const checkInIso = addDaysIso(windowStart, startOffset);
      const checkOutIso = addDaysIso(windowStart, endOffset);
      const todayIso = windowStart;
      const status: MockBooking["status"] =
        checkOutIso < todayIso ? "completed"
        : checkInIso <= todayIso ? "active"
        : "confirmed";
      out.push({
        id: `b-${prop.id}-${bookingCounter++}`,
        propertyId: prop.id,
        brandName: pick(BRANDS, rng()),
        checkInIso,
        checkOutIso,
        status
      });
      cursor = endOffset + 1 + Math.floor(rng() * 2);
    }
  }

  return out;
}

function generateShifts(bookings: MockBooking[], rng: () => number): MockShift[] {
  const out: MockShift[] = [];
  for (const b of bookings) {
    const ciAssigned = rng() > 0.25;
    const coAssigned = rng() > 0.30;
    out.push({ id: `${b.id}-ci`, bookingId: b.id, propertyId: b.propertyId, type: "check_in",  dateIso: b.checkInIso,  assigned: ciAssigned });
    out.push({ id: `${b.id}-co`, bookingId: b.id, propertyId: b.propertyId, type: "check_out", dateIso: b.checkOutIso, assigned: coAssigned });
  }
  return out;
}

function generateCleans(bookings: MockBooking[], rng: () => number): MockClean[] {
  const out: MockClean[] = [];
  for (const b of bookings) {
    out.push({ id: `${b.id}-pre`,  bookingId: b.id, propertyId: b.propertyId, type: "pre_clean",  dateIso: b.checkInIso,  confirmed: rng() > 0.25 });
    out.push({ id: `${b.id}-post`, bookingId: b.id, propertyId: b.propertyId, type: "post_clean", dateIso: b.checkOutIso, confirmed: rng() > 0.20 });
  }
  return out;
}

function buildCell(
  property: Property,
  iso: string,
  bookings: MockBooking[],
  shifts: MockShift[],
  cleans: MockClean[]
): TimelineCell {
  const overlapping = bookings.filter(
    (b) => b.propertyId === property.id && isoBetween(iso, b.checkInIso, b.checkOutIso)
  );
  const primary = overlapping[0] ?? null;

  let state: TimelineCell["state"] = "empty";
  if (primary) {
    const isCi = primary.checkInIso === iso;
    const isCo = primary.checkOutIso === iso;
    if (isCi && isCo) state = "transition";
    else if (isCi) state = "checkin";
    else if (isCo) state = "checkout";
    else state = "occupied";
  }

  const hasUnassignedShift = shifts.some(
    (s) => s.propertyId === property.id && s.dateIso === iso && !s.assigned
  );
  const hasUnconfirmedClean = cleans.some(
    (c) => c.propertyId === property.id && c.dateIso === iso && !c.confirmed
  );

  return {
    date: iso,
    propertyId: property.id,
    state,
    brandName: primary?.brandName ?? null,
    bookingId: primary?.id ?? null,
    bookingStatus: primary?.status ?? null,
    hasUnassignedShift,
    hasUnconfirmedClean
  };
}

function buildProperty(p: typeof MOCK_PROPERTIES[number]): Property {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    postcode: p.postcode,
    tier: p.tier,
    status: p.status,
    keynest_instructions: null,
    cleaning_rate_pence: 15000,
    created_at: NOW_ISO_DEFAULT,
    updated_at: NOW_ISO_DEFAULT
  };
}

export function generateMockDashboard(now: Date = new Date()): DashboardData {
  const windowStart = londonToday(now);
  const days = isoDateRange(windowStart, 14);

  const rng = mulberry32(hashIso(windowStart) ^ 0xa11ce);
  const bookings = generateBookings(windowStart, 14, rng);
  const shifts   = generateShifts(bookings, rng);
  const cleans   = generateCleans(bookings, rng);

  const properties = MOCK_PROPERTIES.map(buildProperty);

  const rows: TimelineRow[] = properties.map((property) => ({
    property,
    cells: days.map((iso) => buildCell(property, iso, bookings, shifts, cleans))
  }));

  // Red flags
  const twoDaysOut = addDaysIso(windowStart, 2);
  const unassignedShiftsNext48h = shifts.filter(
    (s) => !s.assigned && s.dateIso >= windowStart && s.dateIso <= twoDaysOut
  ).length;

  // Overdue reports: bookings that completed before today and would normally
  // have a CO condition report. In the mock we assume 35% are missing.
  const completed = bookings.filter((b) => b.checkOutIso < windowStart);
  const overdueReports = Math.max(
    0,
    Math.round(completed.length * 0.35) + (rng() > 0.5 ? 1 : 0)
  );

  // Deposits approaching deadline: completed bookings with deadline within 3 days
  // of today. Each completed booking has a 14-day window from check_out.
  const depositsApproachingDeadline = completed.filter((b) => {
    const deadline = addDaysIso(b.checkOutIso, 14);
    const daysOut = isoDaysDelta(windowStart, deadline);
    return daysOut >= 0 && daysOut <= 3;
  }).length;

  const flags: RedFlags = {
    unassignedShiftsNext48h,
    overdueReports,
    depositsApproachingDeadline
  };

  // Per-property health
  const health: PropertyHealth[] = properties.map((property) => {
    const propBookings = bookings.filter((b) => b.propertyId === property.id);
    const activeBookings = propBookings.filter((b) =>
      isoBetween(windowStart, b.checkInIso, b.checkOutIso)
    ).length;
    const upcomingCheckIns14d = propBookings.filter(
      (b) => b.checkInIso >= windowStart && b.checkInIso < addDaysIso(windowStart, 14)
    ).length;
    const unassignedShifts14d = shifts.filter(
      (s) => s.propertyId === property.id && !s.assigned && s.dateIso >= windowStart && s.dateIso < addDaysIso(windowStart, 14)
    ).length;
    return { property, activeBookings, upcomingCheckIns14d, unassignedShifts14d };
  });

  return {
    windowStart,
    days,
    rows,
    flags,
    health,
    generatedAt: now.toISOString(),
    source: "mock"
  };
}

function isoDaysDelta(fromIso: string, toIso: string): number {
  // Number of whole days from fromIso to toIso. fromIso <= toIso => >= 0.
  const [fy, fm, fd] = fromIso.split("-").map(Number) as [number, number, number];
  const [ty, tm, td] = toIso.split("-").map(Number) as [number, number, number];
  const f = Date.UTC(fy, fm - 1, fd);
  const t = Date.UTC(ty, tm - 1, td);
  return Math.round((t - f) / 86_400_000);
}
