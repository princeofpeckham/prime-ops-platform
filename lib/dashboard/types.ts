import type { Tables, Enums } from "@/lib/supabase/types";

export type Property = Tables<"properties">;
export type Booking = Tables<"bookings">;
export type Shift = Tables<"shifts">;
export type CleaningJob = Tables<"cleaning_jobs">;
export type ConditionReport = Tables<"condition_reports">;
export type Deposit = Tables<"deposits">;

// -------------------------------------------------------
// Shift and cleaning detail for the event drawer
// -------------------------------------------------------
export type ShiftDetail = {
  id: string;
  type: Enums<"shift_type">;
  status: Enums<"shift_status">;
  assignedBhName: string | null;
  startTime: string;
  endTime: string;
};

export type CleanDetail = {
  id: string;
  type: Enums<"cleaning_job_type">;
  status: Enums<"cleaning_job_status">;
  assignedCleanerName: string | null;
  timeWindow: string | null;
};

// -------------------------------------------------------
// Damage flag from condition reports
// -------------------------------------------------------
export type DamageFlag = {
  id: string;
  reportId: string;
  propertyId: string;
  bookingId: string;
  brandName: string;
  areaName: string;
  condition: Enums<"condition_area_state">;
  notes: string | null;
  flaggedDate: string;           // ISO date when the CO report was submitted
  tradeNeeded: Enums<"trade_type"> | null;
  vendorJobId: string | null;    // null = no vendor job created yet
  vendorJobStatus: Enums<"vendor_job_status"> | null;
  vendorName: string | null;
};

// -------------------------------------------------------
// Event detail: what you see when you click a CI/CO pill
// -------------------------------------------------------
export type EventDetail = {
  bookingId: string;
  externalId: string;
  brandName: string;
  brandEmail: string | null;
  brandPhone: string | null;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  ttvPence: number;
  eventType: "checkin" | "checkout" | "transition";
  shifts: ShiftDetail[];
  cleans: CleanDetail[];
  damageFlags: DamageFlag[];     // flags associated with this booking
};

// -------------------------------------------------------
// Per-cell aggregate. One cell = one property on one day.
// -------------------------------------------------------
export type TimelineCellState =
  | "empty"
  | "checkin"
  | "checkout"
  | "occupied"
  | "transition";

export type TimelineCell = {
  date: string;            // ISO YYYY-MM-DD in Europe/London
  propertyId: string;
  state: TimelineCellState;
  brandName: string | null;
  bookingId: string | null;
  bookingStatus: Booking["status"] | null;
  hasUnassignedShift: boolean;
  hasUnconfirmedClean: boolean;
  hasDamageFlag: boolean;
  damageCount: number;
  // Full detail available on click (populated in mock, loaded on demand in prod)
  eventDetail: EventDetail | null;
};

export type TimelineRow = {
  property: Property;
  cells: TimelineCell[];
};

export type RedFlags = {
  unassignedShiftsNext48h: number;
  overdueReports: number;
  depositsApproachingDeadline: number;
  unresolvedDamageFlags: number;  // damage flags without a vendor job
};

export type PropertyHealth = {
  property: Property;
  activeBookings: number;
  upcomingCheckIns14d: number;
  unassignedShifts14d: number;
  damageFlags: DamageFlag[];      // active damage flags for this property
};

export type DashboardData = {
  windowStart: string;
  days: string[];                // 14 ISO dates
  rows: TimelineRow[];           // one per property, in property name order
  primeRows: TimelineRow[];      // PRIME properties only (for focused view)
  flags: RedFlags;
  health: PropertyHealth[];      // one per property
  allDamageFlags: DamageFlag[];  // all unresolved damage flags across portfolio
  generatedAt: string;
  source: "supabase" | "mock";
};
