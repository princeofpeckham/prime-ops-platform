// Live condition-report data from Supabase. RLS scopes everything to the
// caller's org, so we never filter by org_id on reads.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { alignAreas } from "./labels";
import type {
  AreaDetail,
  CompareData,
  ReportItem,
  ReportSide,
  ReportsData
} from "./types";

type BookingMeta = { external_id: string | null; brand_name: string | null };

export async function fetchReportsFromSupabase(now: Date = new Date()): Promise<ReportsData> {
  const supabase = createSupabaseServerClient();

  const [reportsRes, bookingsRes, propertiesRes] = await Promise.all([
    supabase.from("condition_reports").select("*").order("created_at", { ascending: false }),
    supabase.from("bookings").select("id,external_id,brand_name"),
    supabase.from("properties").select("id,name")
  ]);

  const reports: Tables<"condition_reports">[] = reportsRes.data ?? [];
  const bookings: Pick<Tables<"bookings">, "id" | "external_id" | "brand_name">[] = bookingsRes.data ?? [];
  const properties: Pick<Tables<"properties">, "id" | "name">[] = propertiesRes.data ?? [];

  const bookingById = new Map<string, BookingMeta>(
    bookings.map((b) => [b.id, { external_id: b.external_id, brand_name: b.brand_name }])
  );
  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const items: ReportItem[] = reports.map((r) => {
    const booking = bookingById.get(r.booking_id);
    return {
      id: r.id,
      bookingId: r.booking_id,
      bookingRef: booking?.external_id ?? null,
      brandName: booking?.brand_name ?? null,
      propertyId: r.property_id,
      propertyName: propertyNameById.get(r.property_id) ?? null,
      type: r.type,
      status: r.status,
      overallCondition: r.overall_condition,
      hasDamageFlags: r.has_damage_flags,
      summary: r.summary,
      submittedAt: r.submitted_at,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at
    };
  });

  // Awaiting review first, then most recent.
  items.sort((a, b) => {
    const aPending = a.status === "submitted" ? 0 : 1;
    const bPending = b.status === "submitted" ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return {
    items,
    submittedCount: items.filter((it) => it.status === "submitted").length,
    damageCount: items.filter((it) => it.hasDamageFlags).length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}

function toSide(report: Tables<"condition_reports">, areas: Tables<"condition_report_areas">[]): ReportSide {
  const sideAreas: AreaDetail[] = areas
    .filter((a) => a.report_id === report.id)
    .map((a) => ({ id: a.id, areaName: a.area_name, condition: a.condition, notes: a.notes }));
  return {
    id: report.id,
    type: report.type,
    status: report.status,
    overallCondition: report.overall_condition,
    hasDamageFlags: report.has_damage_flags,
    summary: report.summary,
    submittedAt: report.submitted_at,
    reviewedAt: report.reviewed_at,
    areas: sideAreas
  };
}

export async function fetchCompareFromSupabase(
  bookingId: string,
  now: Date = new Date()
): Promise<CompareData> {
  const supabase = createSupabaseServerClient();

  const reportsRes = await supabase
    .from("condition_reports")
    .select("*")
    .eq("booking_id", bookingId);
  const reports: Tables<"condition_reports">[] = reportsRes.data ?? [];

  const reportIds = reports.map((r) => r.id);
  const areasRes = reportIds.length
    ? await supabase.from("condition_report_areas").select("*").in("report_id", reportIds)
    : { data: [] as Tables<"condition_report_areas">[] };
  const areas: Tables<"condition_report_areas">[] = areasRes.data ?? [];

  const bookingRes = await supabase
    .from("bookings")
    .select("external_id,brand_name,property_id")
    .eq("id", bookingId)
    .maybeSingle();
  const booking: Pick<Tables<"bookings">, "external_id" | "brand_name" | "property_id"> | null =
    bookingRes.data ?? null;

  let propertyName: string | null = null;
  if (booking?.property_id) {
    const propRes = await supabase
      .from("properties")
      .select("name")
      .eq("id", booking.property_id)
      .maybeSingle();
    const prop: Pick<Tables<"properties">, "name"> | null = propRes.data ?? null;
    propertyName = prop?.name ?? null;
  }

  const ciReport = reports.find((r) => r.type === "check_in");
  const coReport = reports.find((r) => r.type === "check_out");
  const checkIn = ciReport ? toSide(ciReport, areas) : null;
  const checkOut = coReport ? toSide(coReport, areas) : null;

  return {
    bookingId,
    bookingRef: booking?.external_id ?? null,
    brandName: booking?.brand_name ?? null,
    propertyName,
    checkIn,
    checkOut,
    rows: alignAreas(checkIn, checkOut),
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
