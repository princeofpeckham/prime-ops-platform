import type { Tables, Enums } from "@/lib/supabase/types";

export type ConditionReportType = Enums<"condition_report_type">;
export type ConditionAreaState = Enums<"condition_area_state">;
export type ConditionOverall = Enums<"condition_overall">;

// A booking the brand host can capture a report against. Hydrated with the
// property name so the picker reads naturally.
export type CaptureBooking = {
  id: string;
  ref: string | null;
  brandName: string;
  propertyId: string;
  propertyName: string | null;
  checkInDate: string;
  checkOutDate: string;
};

// Everything the capture form needs on first paint.
export type CaptureData = {
  bookings: CaptureBooking[];
  source: "supabase" | "mock";
  generatedAt: string;
};

// One row in the brand host's own reports list.
export type MyReportItem = {
  id: string;
  bookingRef: string | null;
  brandName: string | null;
  propertyName: string | null;
  type: ConditionReportType;
  overallCondition: ConditionOverall | null;
  hasDamageFlags: boolean;
  areaCount: number;
  summary: string | null;
  submittedAt: string | null;
  createdAt: string;
};

export type MyReportsData = {
  items: MyReportItem[];
  totalCount: number;
  damageCount: number;
  source: "supabase" | "mock";
  generatedAt: string;
};

// Mirrors the Badge component tones. Kept local so the data layer stays free
// of UI imports.
type Tone = "neutral" | "accent" | "good" | "warn" | "alert" | "muted";

export const TYPE_LABEL: Record<ConditionReportType, string> = {
  check_in: "Check in",
  check_out: "Check out"
};

export const AREA_STATE_LABEL: Record<ConditionAreaState, string> = {
  fine: "Fine",
  minor_wear: "Minor wear",
  damage: "Damage",
  missing: "Missing"
};

export const AREA_STATE_TONE: Record<ConditionAreaState, Tone> = {
  fine: "good",
  minor_wear: "warn",
  damage: "alert",
  missing: "alert"
};

export const OVERALL_LABEL: Record<ConditionOverall, string> = {
  good: "Good",
  minor_issues: "Minor issues",
  damage: "Damage"
};

export const OVERALL_TONE: Record<ConditionOverall, Tone> = {
  good: "good",
  minor_issues: "warn",
  damage: "alert"
};

// Ordered states for the condition selector.
export const AREA_STATES: ConditionAreaState[] = ["fine", "minor_wear", "damage", "missing"];

// Pre-filled rooms every walkthrough starts with. The host can add more.
export const DEFAULT_AREAS: string[] = ["Main Floor", "Walls", "Kitchen", "Bathroom", "Windows"];

// Storage bucket for room photos. Path is `<org_id>/<reportId>/<filename>`.
export const PHOTO_BUCKET = "condition-photos";

// Re-export the raw DB row types for any caller that wants them.
export type ConditionReportRow = Tables<"condition_reports">;
export type ConditionReportAreaRow = Tables<"condition_report_areas">;
