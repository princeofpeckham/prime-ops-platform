"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";
import type { TablesInsert } from "@/lib/supabase/types";
import type { ConditionAreaState, ConditionOverall, ConditionReportType } from "@/lib/report-capture/types";

// One captured room, shaped by the client after photos have been uploaded to
// Storage. Photos are the returned storage paths, not files.
export type AreaInput = {
  areaName: string;
  condition: ConditionAreaState;
  notes: string | null;
  photos: string[];
};

export type SubmitReportInput = {
  // Generated client-side with crypto.randomUUID() so photo paths can be built
  // before the row exists. We reuse it as the report's primary key.
  reportId: string;
  bookingId: string;
  propertyId: string;
  type: ConditionReportType;
  summary: string | null;
  areas: AreaInput[];
};

export type SubmitReportResult = { ok: true; reportId: string } | { ok: false; message: string };

const DAMAGE_STATES: ConditionAreaState[] = ["damage", "missing"];

// Roll the per-area states up into the report's overall verdict.
function computeOverall(areas: AreaInput[]): ConditionOverall {
  if (areas.some((a) => DAMAGE_STATES.includes(a.condition))) return "damage";
  if (areas.some((a) => a.condition === "minor_wear")) return "minor_issues";
  return "good";
}

export async function submitConditionReport(input: SubmitReportInput): Promise<SubmitReportResult> {
  const supabase = createSupabaseServerClient();

  const orgId = await getActiveOrgId();
  if (!orgId) return { ok: false, message: "No active organization" };

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in" };

  if (!input.bookingId) return { ok: false, message: "Pick a booking" };
  if (!input.propertyId) return { ok: false, message: "Booking is missing a property" };

  const areas = input.areas
    .map((a) => ({ ...a, areaName: a.areaName.trim() }))
    .filter((a) => a.areaName.length > 0);
  if (areas.length === 0) return { ok: false, message: "Add at least one area" };

  const overall = computeOverall(areas);
  const hasDamage = areas.some((a) => DAMAGE_STATES.includes(a.condition));
  const nowIso = new Date().toISOString();

  // 1) The report itself, keyed on the client-generated id so it matches the
  // photo storage paths the host already uploaded to.
  const reportRow: TablesInsert<"condition_reports"> = {
    id: input.reportId,
    org_id: orgId,
    booking_id: input.bookingId,
    property_id: input.propertyId,
    type: input.type,
    status: "submitted",
    overall_condition: overall,
    has_damage_flags: hasDamage,
    summary: input.summary?.trim() || null,
    submitted_by: user.id,
    submitted_at: nowIso
  };

  const { error: reportErr } = await supabase.from("condition_reports").insert(reportRow);
  if (reportErr) return { ok: false, message: reportErr.message };

  // 2) One row per captured area.
  const areaRows: TablesInsert<"condition_report_areas">[] = areas.map((a) => ({
    org_id: orgId,
    report_id: input.reportId,
    area_name: a.areaName,
    condition: a.condition,
    notes: a.notes?.trim() || null,
    photos: a.photos
  }));

  const { error: areasErr } = await supabase.from("condition_report_areas").insert(areaRows);
  if (areasErr) return { ok: false, message: areasErr.message };

  // 3) Raise a property flag for every area that needs attention so the ops
  // maintenance queue picks it up.
  const flagRows: TablesInsert<"property_flags">[] = areas
    .filter((a) => DAMAGE_STATES.includes(a.condition))
    .map((a) => ({
      org_id: orgId,
      property_id: input.propertyId,
      title: `${a.areaName} needs attention`,
      description: a.notes?.trim() || null,
      source: "condition_report",
      condition_report_id: input.reportId,
      severity: "medium",
      raised_by: user.id,
      photos: a.photos
    }));

  if (flagRows.length > 0) {
    const { error: flagErr } = await supabase.from("property_flags").insert(flagRows);
    if (flagErr) return { ok: false, message: flagErr.message };
  }

  revalidatePath("/bh/reports");
  revalidatePath("/reports");
  return { ok: true, reportId: input.reportId };
}
