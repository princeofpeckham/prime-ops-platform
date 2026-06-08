import type { Enums } from "@/lib/supabase/types";

export type EnquiryStage = Enums<"enquiry_stage">;
export type BookingStatus = Enums<"booking_status">;
export type ShiftStatus = Enums<"shift_status">;
export type PropertyTier = Enums<"property_tier">;
export type TradeType = Enums<"trade_type">;

// One slice of the funnel: how many enquiries currently sit at a stage.
export type FunnelStageStat = {
  stage: EnquiryStage;
  count: number;
};

// Headline numbers for the stat cards along the top of the screen.
export type HeadlineMetrics = {
  openPipelinePence: number;   // sum of value_pence for enquiries not lost
  openEnquiries: number;       // count of enquiries not lost
  bookingsCount: number;       // total bookings
  totalTtvPence: number;       // sum of bookings.ttv_pence
  shiftsCompleted: number;
  shiftsOpen: number;          // open or applied, ie not yet assigned/done
  vendorCount: number;
  approvedVendorCount: number;
};

// A single row in the small portfolio occupancy chart.
export type OccupancyRow = {
  propertyId: string;
  propertyName: string;
  tier: PropertyTier;
  bookedDays: number;          // distinct days booked in the next 30
  windowDays: number;          // always 30 here
  occupancyPct: number;        // 0..100, bookedDays / windowDays
};

// Compact rows for each underlying table, already shaped for display.
export type EnquiryRow = {
  id: string;
  brandOrTenantName: string;
  stage: EnquiryStage;
  valuePence: number | null;
  propertyName: string | null;
  updatedAt: string;
};

export type BookingRow = {
  id: string;
  externalId: string;
  brandName: string;
  propertyName: string | null;
  checkInDate: string;
  checkOutDate: string;
  ttvPence: number;
  status: BookingStatus;
};

export type ShiftRow = {
  id: string;
  type: Enums<"shift_type">;
  status: ShiftStatus;
  date: string;
  propertyName: string | null;
  assigned: boolean;
};

export type VendorRow = {
  id: string;
  name: string;
  trade: TradeType;
  isApproved: boolean;
  totalJobs: number;
  totalSpendPence: number;
  qualityRating: number | null;
};

export type PropertyRow = {
  id: string;
  name: string;
  tier: PropertyTier;
  status: Enums<"property_status">;
  address: string;
};

export type AnalyticsData = {
  metrics: HeadlineMetrics;
  funnel: FunnelStageStat[];
  occupancy: OccupancyRow[];
  enquiries: EnquiryRow[];
  bookings: BookingRow[];
  shifts: ShiftRow[];
  vendors: VendorRow[];
  properties: PropertyRow[];
  windowStart: string;         // ISO date, first day of the 30 day occupancy window
  source: "supabase" | "mock";
  generatedAt: string;
};
