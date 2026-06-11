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
  DamageFlag,
  EventDetail,
  CleanDetail,
  ShiftDetail,
  Property,
  PropertyHealth,
  RedFlags,
  TimelineCell,
  TimelineRow
} from "./types";
import type { Enums } from "@/lib/supabase/types";

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
  "Ganni", "Jacquemus", "Diptyque", "Acne Studios", "Sezane",
  "Cuyana", "Allbirds", "Patagonia", "Mara Hoffman", "Skims",
  "Maison Cleo", "Lemaire", "Toteme"
];

const BH_NAMES = ["Jasmine Lia", "Amara Cole", "Lucas Webb", "Sophie Hart", "Connor Reid"];
const CLEANER_NAMES = ["Star Clean Ltd", "SpotlessLDN", "GreenClean Co"];

const DAMAGE_AREAS = ["Walls", "Floor", "Windows", "Counter", "Shelving", "Signage area", "Ceiling"];
const DAMAGE_NOTES = [
  "Paint scuffed near entrance",
  "Scratch marks on flooring",
  "Window seal cracked",
  "Counter surface chipped",
  "Shelf bracket pulled from wall",
  "Adhesive residue from signage",
  "Water stain on ceiling tile"
];

const TRADE_MAP: Record<string, Enums<"trade_type">> = {
  "Walls": "painting",
  "Floor": "general",
  "Windows": "general",
  "Counter": "general",
  "Shelving": "general",
  "Signage area": "signage",
  "Ceiling": "painting"
};

const VENDOR_NAMES: Record<string, string[]> = {
  painting: ["ProPaint London", "Dulux Select"],
  signage: ["FORMD", "ASCOT Signs"],
  general: ["FixIt Maintenance", "LDN Repairs"],
  blinds: ["Luxe Blinds", "Complete Blind Service"],
  plumbing: ["Thames Plumbing"],
  electrical: ["Spark Electrical"],
  cleaning: ["Star Clean Ltd"],
  security: ["TSI Security"]
};

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
  return arr[i] as T;
}

type MockBooking = {
  id: string;
  externalId: string;
  propertyId: string;
  brandName: string;
  brandEmail: string;
  brandPhone: string;
  checkInIso: string;
  checkOutIso: string;
  ttvPence: number;
  status: "confirmed" | "active" | "completed" | "cancelled";
};

type MockShift = {
  id: string;
  bookingId: string;
  propertyId: string;
  type: "check_in" | "check_out";
  dateIso: string;
  assigned: boolean;
  assignedBhName: string | null;
  startTime: string;
  endTime: string;
  status: "open" | "applied" | "assigned" | "completed";
};

type MockClean = {
  id: string;
  bookingId: string;
  propertyId: string;
  type: "pre_clean" | "post_clean";
  dateIso: string;
  confirmed: boolean;
  assignedCleanerName: string | null;
  status: "pending" | "dispatched" | "confirmed" | "completed";
  timeWindow: string;
};

type MockDamageFlag = {
  id: string;
  reportId: string;
  propertyId: string;
  bookingId: string;
  brandName: string;
  areaName: string;
  condition: "damage" | "missing";
  notes: string;
  flaggedDate: string;
  tradeNeeded: Enums<"trade_type">;
  hasVendorJob: boolean;
  vendorJobId: string | null;
  vendorJobStatus: Enums<"vendor_job_status"> | null;
  vendorName: string | null;
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

    let cursor = -Math.floor(rng() * 4);
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
      const brandName = pick(BRANDS, rng());
      out.push({
        id: `b-${prop.id}-${bookingCounter++}`,
        externalId: `BR-${10000 + bookingCounter}`,
        propertyId: prop.id,
        brandName,
        brandEmail: `${brandName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        brandPhone: `+44 7${String(Math.floor(rng() * 900000000 + 100000000))}`,
        checkInIso,
        checkOutIso,
        ttvPence: Math.round((500 + rng() * 4500) * 100),
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
    out.push({
      id: `${b.id}-ci`,
      bookingId: b.id,
      propertyId: b.propertyId,
      type: "check_in",
      dateIso: b.checkInIso,
      assigned: ciAssigned,
      assignedBhName: ciAssigned ? pick(BH_NAMES, rng()) : null,
      startTime: "08:45",
      endTime: "10:00",
      status: ciAssigned ? "assigned" : "open"
    });
    out.push({
      id: `${b.id}-co`,
      bookingId: b.id,
      propertyId: b.propertyId,
      type: "check_out",
      dateIso: b.checkOutIso,
      assigned: coAssigned,
      assignedBhName: coAssigned ? pick(BH_NAMES, rng()) : null,
      startTime: "16:45",
      endTime: "17:30",
      status: coAssigned ? "assigned" : "open"
    });
  }
  return out;
}

function generateCleans(bookings: MockBooking[], rng: () => number): MockClean[] {
  const out: MockClean[] = [];
  for (const b of bookings) {
    const preConfirmed = rng() > 0.25;
    const postConfirmed = rng() > 0.20;
    out.push({
      id: `${b.id}-pre`,
      bookingId: b.id,
      propertyId: b.propertyId,
      type: "pre_clean",
      dateIso: b.checkInIso,
      confirmed: preConfirmed,
      assignedCleanerName: preConfirmed ? pick(CLEANER_NAMES, rng()) : null,
      status: preConfirmed ? "confirmed" : "pending",
      timeWindow: "07:00 - 08:30"
    });
    out.push({
      id: `${b.id}-post`,
      bookingId: b.id,
      propertyId: b.propertyId,
      type: "post_clean",
      dateIso: b.checkOutIso,
      confirmed: postConfirmed,
      assignedCleanerName: postConfirmed ? pick(CLEANER_NAMES, rng()) : null,
      status: postConfirmed ? "confirmed" : "pending",
      timeWindow: "17:30 - 19:00"
    });
  }
  return out;
}

function generateDamageFlags(
  bookings: MockBooking[],
  windowStart: string,
  rng: () => number
): MockDamageFlag[] {
  const out: MockDamageFlag[] = [];
  let counter = 0;
  // Only generate damage flags for completed or active bookings at PRIME properties
  const primeBookings = bookings.filter(
    (b) => MOCK_PROPERTIES.find((p) => p.id === b.propertyId)?.tier === "prime"
      && (b.status === "completed" || b.status === "active")
  );

  for (const b of primeBookings) {
    // ~30% chance of damage on checkout
    if (rng() > 0.30) continue;
    const areaIdx = Math.floor(rng() * DAMAGE_AREAS.length);
    const area = DAMAGE_AREAS[areaIdx] as string;
    const trade = TRADE_MAP[area] ?? "general";
    const hasVendorJob = rng() > 0.5;
    const vendorNames = VENDOR_NAMES[trade] ?? ["FixIt Maintenance"];
    const vendorJobStatus: Enums<"vendor_job_status"> | null = hasVendorJob
      ? pick(["quoted", "approved", "scheduled", "in_progress"] as const, rng())
      : null;

    out.push({
      id: `dmg-${counter++}`,
      reportId: `cr-${b.id}-co`,
      propertyId: b.propertyId,
      bookingId: b.id,
      brandName: b.brandName,
      areaName: area,
      condition: rng() > 0.8 ? "missing" : "damage",
      notes: DAMAGE_NOTES[areaIdx] ?? "Damage noted",
      flaggedDate: b.checkOutIso < windowStart ? b.checkOutIso : windowStart,
      tradeNeeded: trade,
      hasVendorJob,
      vendorJobId: hasVendorJob ? `vj-${counter}` : null,
      vendorJobStatus,
      vendorName: hasVendorJob ? pick(vendorNames, rng()) : null
    });
  }
  return out;
}

function buildShiftDetails(shifts: MockShift[], bookingId: string): ShiftDetail[] {
  return shifts
    .filter((s) => s.bookingId === bookingId)
    .map((s) => ({
      id: s.id,
      type: s.type,
      status: s.status,
      assignedBhName: s.assignedBhName,
      startTime: s.startTime,
      endTime: s.endTime
    }));
}

function buildCleanDetails(cleans: MockClean[], bookingId: string): CleanDetail[] {
  return cleans
    .filter((c) => c.bookingId === bookingId)
    .map((c) => ({
      id: c.id,
      type: c.type,
      status: c.status,
      assignedCleanerName: c.assignedCleanerName,
      timeWindow: c.timeWindow
    }));
}

function buildEventDetail(
  booking: MockBooking,
  propertyName: string,
  eventType: "checkin" | "checkout" | "transition",
  shifts: MockShift[],
  cleans: MockClean[],
  damageFlags: MockDamageFlag[]
): EventDetail {
  return {
    bookingId: booking.id,
    externalId: booking.externalId,
    brandName: booking.brandName,
    brandEmail: booking.brandEmail,
    brandPhone: booking.brandPhone,
    propertyName,
    checkInDate: booking.checkInIso,
    checkOutDate: booking.checkOutIso,
    ttvPence: booking.ttvPence,
    eventType,
    shifts: buildShiftDetails(shifts, booking.id),
    cleans: buildCleanDetails(cleans, booking.id),
    damageFlags: damageFlags
      .filter((d) => d.bookingId === booking.id)
      .map((d) => ({
        id: d.id,
        reportId: d.reportId,
        propertyId: d.propertyId,
        bookingId: d.bookingId,
        brandName: d.brandName,
        areaName: d.areaName,
        condition: d.condition,
        notes: d.notes,
        flaggedDate: d.flaggedDate,
        tradeNeeded: d.tradeNeeded,
        vendorJobId: d.vendorJobId,
        vendorJobStatus: d.vendorJobStatus,
        vendorName: d.vendorName
      }))
  };
}

function buildCell(
  property: Property,
  iso: string,
  bookings: MockBooking[],
  shifts: MockShift[],
  cleans: MockClean[],
  damageFlags: MockDamageFlag[]
): TimelineCell {
  const overlapping = bookings.filter(
    (b) => b.propertyId === property.id && isoBetween(iso, b.checkInIso, b.checkOutIso)
  );
  const primary = overlapping[0] ?? null;

  let state: TimelineCell["state"] = "empty";
  let eventType: "checkin" | "checkout" | "transition" | null = null;
  if (primary) {
    const isCi = primary.checkInIso === iso;
    const isCo = primary.checkOutIso === iso;
    if (isCi && isCo) { state = "transition"; eventType = "transition"; }
    else if (isCi) { state = "checkin"; eventType = "checkin"; }
    else if (isCo) { state = "checkout"; eventType = "checkout"; }
    else state = "occupied";
  }

  const hasUnassignedShift = shifts.some(
    (s) => s.propertyId === property.id && s.dateIso === iso && !s.assigned
  );
  const hasUnconfirmedClean = cleans.some(
    (c) => c.propertyId === property.id && c.dateIso === iso && !c.confirmed
  );

  // Damage flags for this property on this date
  const cellDamageFlags = damageFlags.filter(
    (d) => d.propertyId === property.id && d.flaggedDate === iso
  );

  const eventDetail: EventDetail | null =
    primary && eventType
      ? buildEventDetail(primary, property.name, eventType, shifts, cleans, damageFlags)
      : null;

  return {
    date: iso,
    propertyId: property.id,
    state,
    brandName: primary?.brandName ?? null,
    bookingId: primary?.id ?? null,
    bookingStatus: primary?.status ?? null,
    hasUnassignedShift,
    hasUnconfirmedClean,
    hasDamageFlag: cellDamageFlags.length > 0,
    damageCount: cellDamageFlags.length,
    eventDetail
  };
}

// Deterministic Appear Here org id, matches supabase/migrations/20260605120001.
const MOCK_ORG_ID = "a0000000-0000-4000-8000-000000000001";

function buildProperty(p: typeof MOCK_PROPERTIES[number]): Property {
  return {
    id: p.id,
    org_id: MOCK_ORG_ID,
    name: p.name,
    address: p.address,
    postcode: p.postcode,
    tier: p.tier,
    status: p.status,
    keynest_instructions: null,
    cleaning_rate_pence: 15000,
    landlord_contact_name: null,
    landlord_contact_email: null,
    landlord_contact_phone: null,
    invoice_prefix: null,
    invoice_next_seq: 1,
    created_at: NOW_ISO_DEFAULT,
    updated_at: NOW_ISO_DEFAULT
  };
}

function isoDaysDelta(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number) as [number, number, number];
  const [ty, tm, td] = toIso.split("-").map(Number) as [number, number, number];
  const f = Date.UTC(fy, fm - 1, fd);
  const t = Date.UTC(ty, tm - 1, td);
  return Math.round((t - f) / 86_400_000);
}

export function generateMockDashboard(now: Date = new Date()): DashboardData {
  const windowStart = londonToday(now);
  const days = isoDateRange(windowStart, 14);

  const rng = mulberry32(hashIso(windowStart) ^ 0xa11ce);
  const bookings = generateBookings(windowStart, 14, rng);
  const shifts   = generateShifts(bookings, rng);
  const cleans   = generateCleans(bookings, rng);
  const damageFlags = generateDamageFlags(bookings, windowStart, rng);

  const properties = MOCK_PROPERTIES.map(buildProperty);

  const rows: TimelineRow[] = properties.map((property) => ({
    property,
    cells: days.map((iso) => buildCell(property, iso, bookings, shifts, cleans, damageFlags))
  }));

  const primeRows = rows.filter((r) => r.property.tier === "prime");

  // Red flags
  const twoDaysOut = addDaysIso(windowStart, 2);
  const unassignedShiftsNext48h = shifts.filter(
    (s) => !s.assigned && s.dateIso >= windowStart && s.dateIso <= twoDaysOut
  ).length;

  const completed = bookings.filter((b) => b.checkOutIso < windowStart);
  const overdueReports = Math.max(
    0,
    Math.round(completed.length * 0.35) + (rng() > 0.5 ? 1 : 0)
  );

  const depositsApproachingDeadline = completed.filter((b) => {
    const deadline = addDaysIso(b.checkOutIso, 14);
    const daysOut = isoDaysDelta(windowStart, deadline);
    return daysOut >= 0 && daysOut <= 3;
  }).length;

  const unresolvedDamageFlags = damageFlags.filter((d) => !d.hasVendorJob).length;

  const flags: RedFlags = {
    unassignedShiftsNext48h,
    overdueReports,
    depositsApproachingDeadline,
    unresolvedDamageFlags
  };

  // Per-property health with damage flags
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
    const propDamageFlags: DamageFlag[] = damageFlags
      .filter((d) => d.propertyId === property.id)
      .map((d) => ({
        id: d.id,
        reportId: d.reportId,
        propertyId: d.propertyId,
        bookingId: d.bookingId,
        brandName: d.brandName,
        areaName: d.areaName,
        condition: d.condition,
        notes: d.notes,
        flaggedDate: d.flaggedDate,
        tradeNeeded: d.tradeNeeded,
        vendorJobId: d.vendorJobId,
        vendorJobStatus: d.vendorJobStatus,
        vendorName: d.vendorName
      }));
    return { property, activeBookings, upcomingCheckIns14d, unassignedShifts14d, damageFlags: propDamageFlags };
  });

  const allDamageFlags: DamageFlag[] = damageFlags.map((d) => ({
    id: d.id,
    reportId: d.reportId,
    propertyId: d.propertyId,
    bookingId: d.bookingId,
    brandName: d.brandName,
    areaName: d.areaName,
    condition: d.condition,
    notes: d.notes,
    flaggedDate: d.flaggedDate,
    tradeNeeded: d.tradeNeeded,
    vendorJobId: d.vendorJobId,
    vendorJobStatus: d.vendorJobStatus,
    vendorName: d.vendorName
  }));

  return {
    windowStart,
    days,
    rows,
    primeRows,
    flags,
    health,
    allDamageFlags,
    generatedAt: now.toISOString(),
    source: "mock"
  };
}
