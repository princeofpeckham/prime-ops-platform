import type { Enums } from "@/lib/supabase/types";

export type EnquiryStage = Enums<"enquiry_stage">;
export type BookingStatus = Enums<"booking_status">;
export type ShiftStatus = Enums<"shift_status">;
export type PropertyTier = Enums<"property_tier">;
export type TradeType = Enums<"trade_type">;
export type DepositStatus = Enums<"deposit_status">;

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

// Per-space deposit tracker: how each property's deposits are faring.
export type DepositSpaceRow = {
  propertyId: string;
  propertyName: string;
  heldCount: number;             // deposits still open (not processed or auto refunded)
  deductedPence: number;         // sum of deductions proposed, approved or processed
  refundedCount: number;         // deposits auto refunded in full
};

export type DepositsAnalytics = {
  bySpace: DepositSpaceRow[];
  totalDeductedThisYearPence: number;  // deductions on deposits checked out this calendar year
};

// One space's year-to-date history from the imported space_metrics table.
export type OccupancyHistorySpace = {
  propertyId: string;
  name: string;
  currentYearBookedDays: number;
  currentYearTtvPence: number;
  currentYearOccupancyPct: number;   // booked days / days elapsed this year, capped at 100
  avgDayRatePence: number;           // TTV / booked days, 0 when nothing booked
  priorYearTtvPence: number;
};

// One month of the current year, summed across all spaces.
export type OccupancyHistoryMonth = {
  month: string;                     // "YYYY-MM"
  ttvPence: number;
  bookedDays: number;
};

export type OccupancyHistory = {
  bySpace: OccupancyHistorySpace[];  // only spaces that have history rows
  monthly: OccupancyHistoryMonth[];  // always Jan..Dec of the current year
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
  deposits: DepositsAnalytics;
  occupancyHistory: OccupancyHistory;
  windowStart: string;         // ISO date, first day of the 30 day occupancy window
  source: "supabase" | "mock";
  generatedAt: string;
};
