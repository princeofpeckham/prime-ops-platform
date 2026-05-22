import type { Tables } from "@/lib/supabase/types";

export type Property = Tables<"properties">;
export type Booking = Tables<"bookings">;
export type Shift = Tables<"shifts">;
export type CleaningJob = Tables<"cleaning_jobs">;
export type ConditionReport = Tables<"condition_reports">;
export type Deposit = Tables<"deposits">;

// Per-cell aggregate. One cell = one property on one day.
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
};

export type TimelineRow = {
  property: Property;
  cells: TimelineCell[];
};

export type RedFlags = {
  unassignedShiftsNext48h: number;
  overdueReports: number;        // submitted reports still un-reviewed > 24h, or expected reports missing
  depositsApproachingDeadline: number; // <= 3 days to deadline, still pending
};

export type PropertyHealth = {
  property: Property;
  activeBookings: number;        // overlapping today
  upcomingCheckIns14d: number;
  unassignedShifts14d: number;
};

export type DashboardData = {
  // Window start (inclusive) in Europe/London. 14 days, [start, start + 14).
  windowStart: string;
  days: string[];                // 14 ISO dates
  rows: TimelineRow[];           // one per property, in property name order
  flags: RedFlags;
  health: PropertyHealth[];      // one per property
  generatedAt: string;           // ISO timestamp
  source: "supabase" | "mock";
};
