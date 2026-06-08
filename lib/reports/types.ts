import type { Tables, Enums } from "@/lib/supabase/types";

export type ConditionReport = Tables<"condition_reports">;
export type ConditionReportArea = Tables<"condition_report_areas">;
export type ConditionReportType = Enums<"condition_report_type">;
export type ConditionReportStatus = Enums<"condition_report_status">;
export type ConditionOverall = Enums<"condition_overall">;
export type ConditionAreaState = Enums<"condition_area_state">;

// One condition report row, hydrated for the review queue.
export type ReportItem = {
  id: string;
  bookingId: string;
  bookingRef: string | null;
  brandName: string | null;
  propertyId: string;
  propertyName: string | null;
  type: ConditionReportType;
  status: ConditionReportStatus;
  overallCondition: ConditionOverall | null;
  hasDamageFlags: boolean;
  summary: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type ReportsData = {
  items: ReportItem[];
  submittedCount: number;     // reports still awaiting review
  damageCount: number;        // reports with damage flags
  source: "supabase" | "mock";
  generatedAt: string;
};

// One area within a report, used by the side-by-side compare view.
export type AreaDetail = {
  id: string;
  areaName: string;
  condition: ConditionAreaState;
  notes: string | null;
};

// A single report plus its areas, for one side of the compare view.
export type ReportSide = {
  id: string;
  type: ConditionReportType;
  status: ConditionReportStatus;
  overallCondition: ConditionOverall | null;
  hasDamageFlags: boolean;
  summary: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  areas: AreaDetail[];
};

// One row in the aligned compare table: an area name with its
// check in and check out state (either side may be missing).
export type CompareRow = {
  areaName: string;
  checkIn: AreaDetail | null;
  checkOut: AreaDetail | null;
};

export type CompareData = {
  bookingId: string;
  bookingRef: string | null;
  brandName: string | null;
  propertyName: string | null;
  checkIn: ReportSide | null;
  checkOut: ReportSide | null;
  rows: CompareRow[];
  source: "supabase" | "mock";
  generatedAt: string;
};
