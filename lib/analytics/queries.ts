// Live analytics from Supabase. RLS scopes everything to the caller's org,
// so we never filter by org_id here. Metrics are computed in-process from the
// fetched rows, reusing the pure helpers in compute.ts.

import { londonToday } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import {
  OCCUPANCY_WINDOW_DAYS,
  buildDepositsAnalytics,
  buildFunnel,
  buildOccupancy,
  buildOccupancyHistory,
  isOpenStage
} from "./compute";
import type {
  AnalyticsData,
  BookingRow,
  EnquiryRow,
  HeadlineMetrics,
  PropertyRow,
  ShiftRow,
  VendorRow
} from "./types";

export async function fetchAnalyticsFromSupabase(now: Date = new Date()): Promise<AnalyticsData> {
  const supabase = createSupabaseServerClient();
  const windowStart = londonToday(now);

  const [enquiriesRes, bookingsRes, shiftsRes, vendorsRes, propertiesRes, depositsRes, spaceMetricsRes] = await Promise.all([
    supabase.from("enquiries").select("*").order("updated_at", { ascending: false }),
    supabase.from("bookings").select("*").order("check_in_date", { ascending: true }),
    supabase.from("shifts").select("*").order("date", { ascending: true }),
    supabase.from("vendors").select("*").order("name"),
    supabase.from("properties").select("*").order("name"),
    supabase.from("deposits").select("*"),
    supabase.from("space_metrics").select("*").order("month", { ascending: true })
  ]);

  const enquiries: Tables<"enquiries">[] = enquiriesRes.data ?? [];
  const bookings: Tables<"bookings">[] = bookingsRes.data ?? [];
  const shifts: Tables<"shifts">[] = shiftsRes.data ?? [];
  const vendors: Tables<"vendors">[] = vendorsRes.data ?? [];
  const properties: Tables<"properties">[] = propertiesRes.data ?? [];
  const depositRows: Tables<"deposits">[] = depositsRes.data ?? [];
  const spaceMetricRows: Tables<"space_metrics">[] = spaceMetricsRes.data ?? [];

  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const enquiryRows: EnquiryRow[] = enquiries.map((e) => ({
    id: e.id,
    brandOrTenantName: e.brand_or_tenant_name,
    stage: e.stage,
    valuePence: e.value_pence,
    propertyName: e.property_id ? propertyNameById.get(e.property_id) ?? null : null,
    updatedAt: e.updated_at
  }));

  const bookingRows: BookingRow[] = bookings.map((b) => ({
    id: b.id,
    externalId: b.external_id,
    brandName: b.brand_name,
    propertyName: propertyNameById.get(b.property_id) ?? null,
    checkInDate: b.check_in_date,
    checkOutDate: b.check_out_date,
    ttvPence: b.ttv_pence,
    status: b.status
  }));

  const shiftRows: ShiftRow[] = shifts.map((s) => ({
    id: s.id,
    type: s.type,
    status: s.status,
    date: s.date,
    propertyName: propertyNameById.get(s.property_id) ?? null,
    assigned: s.assigned_bh_id !== null
  }));

  const vendorRows: VendorRow[] = vendors.map((v) => ({
    id: v.id,
    name: v.name,
    trade: v.trade,
    isApproved: v.is_approved,
    totalJobs: v.total_jobs,
    totalSpendPence: v.total_spend_pence,
    qualityRating: v.quality_rating
  }));

  const propertyRows: PropertyRow[] = properties.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    status: p.status,
    address: p.address
  }));

  const openEnquiries = enquiries.filter((e) => isOpenStage(e.stage));
  const metrics: HeadlineMetrics = {
    openPipelinePence: openEnquiries.reduce((sum, e) => sum + (e.value_pence ?? 0), 0),
    openEnquiries: openEnquiries.length,
    bookingsCount: bookings.length,
    totalTtvPence: bookings.reduce((sum, b) => sum + b.ttv_pence, 0),
    shiftsCompleted: shifts.filter((s) => s.status === "completed").length,
    shiftsOpen: shifts.filter((s) => s.status === "open" || s.status === "applied").length,
    vendorCount: vendors.length,
    approvedVendorCount: vendors.filter((v) => v.is_approved).length
  };

  const funnel = buildFunnel(enquiries.map((e) => e.stage));

  const occupancy = buildOccupancy(
    properties.map((p) => ({ id: p.id, name: p.name, tier: p.tier })),
    bookings.map((b) => ({
      propertyId: b.property_id,
      checkInDate: b.check_in_date,
      checkOutDate: b.check_out_date
    })),
    windowStart,
    OCCUPANCY_WINDOW_DAYS
  );

  const deposits = buildDepositsAnalytics(
    properties.map((p) => ({ id: p.id, name: p.name })),
    depositRows.map((d) => ({
      propertyId: d.property_id,
      status: d.status,
      deductionAmountPence: d.deduction_amount_pence,
      checkoutDate: d.checkout_date
    })),
    windowStart
  );

  const occupancyHistory = buildOccupancyHistory(
    spaceMetricRows.map((r) => ({
      propertyId: r.property_id,
      month: r.month,
      bookedDays: r.booked_days,
      ttvPence: r.ttv_pence
    })),
    propertyNameById,
    windowStart
  );

  return {
    metrics,
    funnel,
    occupancy,
    enquiries: enquiryRows,
    bookings: bookingRows,
    shifts: shiftRows,
    vendors: vendorRows,
    properties: propertyRows,
    deposits,
    occupancyHistory,
    windowStart,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
