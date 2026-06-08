// Pure presentation helpers and the area-alignment logic for condition
// reports. No Supabase, no React, so this stays easy to reason about.

import type {
  AreaDetail,
  CompareRow,
  ConditionAreaState,
  ConditionOverall,
  ConditionReportStatus,
  ConditionReportType,
  ReportSide
} from "./types";

// Mirrors the Badge component tones. Kept local so this stays a pure module
// with no UI imports in the data layer.
type Tone = "neutral" | "accent" | "good" | "warn" | "alert" | "muted";

export const TYPE_LABEL: Record<ConditionReportType, string> = {
  check_in: "Check in",
  check_out: "Check out"
};

export const STATUS_LABEL: Record<ConditionReportStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  reviewed: "Reviewed"
};

export const STATUS_TONE: Record<ConditionReportStatus, Tone> = {
  draft: "muted",
  submitted: "accent",
  reviewed: "good"
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

// True when the area got worse from check in to check out, so the compare
// view can highlight regressions.
const STATE_SEVERITY: Record<ConditionAreaState, number> = {
  fine: 0,
  minor_wear: 1,
  damage: 2,
  missing: 3
};

export function isRegression(before: ConditionAreaState | null, after: ConditionAreaState | null): boolean {
  if (!before || !after) return false;
  return STATE_SEVERITY[after] > STATE_SEVERITY[before];
}

// Align the check in and check out areas into one ordered set of rows,
// keyed by area name. Check in order leads; check out only areas are
// appended afterwards so nothing is dropped.
export function alignAreas(checkIn: ReportSide | null, checkOut: ReportSide | null): CompareRow[] {
  const order: string[] = [];
  const seen = new Set<string>();
  const ciByName = new Map<string, AreaDetail>();
  const coByName = new Map<string, AreaDetail>();

  for (const area of checkIn?.areas ?? []) {
    ciByName.set(area.areaName, area);
    if (!seen.has(area.areaName)) {
      seen.add(area.areaName);
      order.push(area.areaName);
    }
  }
  for (const area of checkOut?.areas ?? []) {
    coByName.set(area.areaName, area);
    if (!seen.has(area.areaName)) {
      seen.add(area.areaName);
      order.push(area.areaName);
    }
  }

  return order.map((areaName) => ({
    areaName,
    checkIn: ciByName.get(areaName) ?? null,
    checkOut: coByName.get(areaName) ?? null
  }));
}
