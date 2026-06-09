// Live capture data from Supabase. RLS scopes everything to the caller's org,
// so we never filter by org_id on reads. The reports list is additionally
// narrowed to the signed-in brand host's own submissions.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { CaptureBooking, CaptureData, MyReportItem, MyReportsData } from "./types";

type BookingPick = Pick<
  Tables<"bookings">,
  "id" | "external_id" | "brand_name" | "property_id" | "check_in_date" | "check_out_date"
>;

// Bookings the brand host can attach a report to: active or confirmed, soonest
// check out first so an ending tenancy surfaces at the top.
export async function fetchCaptureFromSupabase(now: Date = new Date()): Promise<CaptureData> {
  const supabase = createSupabaseServerClient();

  const [bookingsRes, propertiesRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id,external_id,brand_name,property_id,check_in_date,check_out_date")
      .in("status", ["confirmed", "active"])
      .order("check_out_date", { ascending: true }),
    supabase.from("properties").select("id,name")
  ]);

  const bookings: BookingPick[] = bookingsRes.data ?? [];
  const properties: Pick<Tables<"properties">, "id" | "name">[] = propertiesRes.data ?? [];
  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const mapped: CaptureBooking[] = bookings.map((b) => ({
    id: b.id,
    ref: b.external_id,
    brandName: b.brand_name,
    propertyId: b.property_id,
    propertyName: propertyNameById.get(b.property_id) ?? null,
    checkInDate: b.check_in_date,
    checkOutDate: b.check_out_date
  }));

  return {
    bookings: mapped,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}

type ReportPick = Pick<
  Tables<"condition_reports">,
  | "id"
  | "booking_id"
  | "property_id"
  | "type"
  | "overall_condition"
  | "has_damage_flags"
  | "summary"
  | "submitted_at"
  | "created_at"
  | "submitted_by"
>;

export async function fetchMyReportsFromSupabase(now: Date = new Date()): Promise<MyReportsData> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // No session: nothing to show. RLS would block anyway.
  if (!user) {
    return { items: [], totalCount: 0, damageCount: 0, source: "supabase", generatedAt: now.toISOString() };
  }

  const reportsRes = await supabase
    .from("condition_reports")
    .select(
      "id,booking_id,property_id,type,overall_condition,has_damage_flags,summary,submitted_at,created_at,submitted_by"
    )
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });
  const reports: ReportPick[] = reportsRes.data ?? [];

  const bookingIds = Array.from(new Set(reports.map((r) => r.booking_id)));
  const propertyIds = Array.from(new Set(reports.map((r) => r.property_id)));
  const reportIds = reports.map((r) => r.id);

  const [bookingsRes, propertiesRes, areasRes] = await Promise.all([
    bookingIds.length
      ? supabase.from("bookings").select("id,external_id,brand_name").in("id", bookingIds)
      : Promise.resolve({ data: [] as Pick<Tables<"bookings">, "id" | "external_id" | "brand_name">[] }),
    propertyIds.length
      ? supabase.from("properties").select("id,name").in("id", propertyIds)
      : Promise.resolve({ data: [] as Pick<Tables<"properties">, "id" | "name">[] }),
    reportIds.length
      ? supabase.from("condition_report_areas").select("report_id").in("report_id", reportIds)
      : Promise.resolve({ data: [] as Pick<Tables<"condition_report_areas">, "report_id">[] })
  ]);

  const bookings: Pick<Tables<"bookings">, "id" | "external_id" | "brand_name">[] = bookingsRes.data ?? [];
  const properties: Pick<Tables<"properties">, "id" | "name">[] = propertiesRes.data ?? [];
  const areas: Pick<Tables<"condition_report_areas">, "report_id">[] = areasRes.data ?? [];

  const bookingById = new Map(bookings.map((b) => [b.id, b]));
  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));
  const areaCountByReport = new Map<string, number>();
  for (const a of areas) {
    areaCountByReport.set(a.report_id, (areaCountByReport.get(a.report_id) ?? 0) + 1);
  }

  const items: MyReportItem[] = reports.map((r) => {
    const booking = bookingById.get(r.booking_id);
    return {
      id: r.id,
      bookingRef: booking?.external_id ?? null,
      brandName: booking?.brand_name ?? null,
      propertyName: propertyNameById.get(r.property_id) ?? null,
      type: r.type,
      overallCondition: r.overall_condition,
      hasDamageFlags: r.has_damage_flags,
      areaCount: areaCountByReport.get(r.id) ?? 0,
      summary: r.summary,
      submittedAt: r.submitted_at,
      createdAt: r.created_at
    };
  });

  return {
    items,
    totalCount: items.length,
    damageCount: items.filter((it) => it.hasDamageFlags).length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
