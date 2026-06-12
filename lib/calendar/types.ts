import type { Enums } from "@/lib/supabase/types";

// The vocabulary that drives every chip, dot and legend entry on the calendar.
// Mapped from three live sources: shifts, cleaning_jobs and maintenance_jobs.
export type CalendarEventKind =
  | "check_in"
  | "check_out"
  | "viewing"
  | "clean"
  | "maintenance";

export type MaintenanceStatus = Enums<"maintenance_status">;
export type TradeType = Enums<"trade_type">;
export type CleaningJobType = Enums<"cleaning_job_type">;
export type PropertyTier = Enums<"property_tier">;

// A single thing happening on a given day at a property. Time is optional:
// shifts carry a start time, cleans a window, maintenance usually none.
export type CalendarEvent = {
  id: string;
  kind: CalendarEventKind;
  date: string;                 // ISO YYYY-MM-DD
  propertyId: string | null;
  propertyName: string | null;
  title: string;                // brand for shifts, "Pre-clean" etc, job title for maintenance
  time: string | null;          // "08:45" style, or a window, or null
  trade: TradeType | null;      // maintenance only
  maintenanceStatus: MaintenanceStatus | null; // maintenance only, drives severity colour
  cleanType: CleaningJobType | null;            // clean only
};

// A maintenance job as shown in the management panel (scheduled or not).
export type MaintenanceItem = {
  id: string;
  propertyId: string;
  propertyName: string | null;
  title: string;
  description: string | null;
  trade: TradeType | null;
  status: MaintenanceStatus;
  scheduledDate: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type PropertyOption = { id: string; name: string; tier: PropertyTier | null };

// A booking rendered as a continuous bar across every occupied day,
// check-in to check-out inclusive. Cancelled bookings are excluded upstream.
export type Tenancy = {
  bookingId: string;
  propertyId: string;
  propertyName: string | null;
  brandName: string;
  startDate: string; // ISO YYYY-MM-DD (check-in)
  endDate: string;   // ISO YYYY-MM-DD (check-out, inclusive)
};

// Counts for the summary strip, scoped to the visible month.
export type MonthSummary = {
  viewings: number;
  checkIns: number;
  checkOuts: number;
  cleans: number;
  openMaintenance: number; // unscheduled + scheduled + in_progress
};

export type CalendarData = {
  events: CalendarEvent[];
  tenancies: Tenancy[];
  maintenance: MaintenanceItem[];
  properties: PropertyOption[];
  source: "supabase" | "mock";
  generatedAt: string;
};
