// Supabase query path for the Ops Command Centre.
// Engaged when NEXT_PUBLIC_USE_MOCK_DATA is not "true".
// Once migrations land and seed data is in place, this becomes the live path.

import { addDaysIso, isoBetween, isoDateRange, londonToday } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type {
  DamageFlag,
  DashboardData,
  EventDetail,
  PropertyHealth,
  RedFlags,
  TimelineCell,
  TimelineRow
} from "./types";

export async function fetchDashboardFromSupabase(now: Date = new Date()): Promise<DashboardData> {
  const supabase = createSupabaseServerClient();
  const windowStart = londonToday(now);
  const windowEndExclusive = addDaysIso(windowStart, 14);
  const days = isoDateRange(windowStart, 14);

  const [propsRes, bookingsRes, shiftsRes, cleansRes, depositsRes, reportsRes, vendorJobsRes] = await Promise.all([
    supabase.from("properties").select("*").order("name"),
    supabase
      .from("bookings")
      .select("*")
      .gte("check_out_date", addDaysIso(windowStart, -30))
      .lt("check_in_date", windowEndExclusive),
    supabase
      .from("shifts")
      .select("*")
      .gte("date", windowStart)
      .lt("date", windowEndExclusive),
    supabase
      .from("cleaning_jobs")
      .select("*")
      .gte("date", windowStart)
      .lt("date", windowEndExclusive),
    supabase
      .from("deposits")
      .select("*")
      .in("status", ["pending_review", "deduction_proposed"])
      .lte("deadline_date", addDaysIso(windowStart, 3)),
    supabase
      .from("condition_reports")
      .select("*, condition_report_areas(*)")
      .eq("has_damage_flags", true),
    supabase
      .from("vendor_jobs")
      .select("*, vendors(name)")
      .not("status", "in", '("completed","disputed")')
  ]);

  const properties: Tables<"properties">[]    = propsRes.data     ?? [];
  const bookings:   Tables<"bookings">[]      = bookingsRes.data  ?? [];
  const shifts:     Tables<"shifts">[]        = shiftsRes.data    ?? [];
  const cleans:     Tables<"cleaning_jobs">[] = cleansRes.data    ?? [];
  const deposits:   Tables<"deposits">[]      = depositsRes.data  ?? [];

  // Build damage flags from condition report areas with damage/missing state
  const reportData: any[] = reportsRes.data ?? []; // eslint-disable-line
  const vendorJobData: any[] = vendorJobsRes.data ?? []; // eslint-disable-line
  const allDamageFlags: DamageFlag[] = [];

  for (const report of reportData) {
    const booking = bookings.find((b: any) => b.id === report.booking_id); // eslint-disable-line
    const areas: any[] = report.condition_report_areas ?? []; // eslint-disable-line
    for (const area of areas) {
      if (area.condition !== "damage" && area.condition !== "missing") continue;
      const vendorJob = vendorJobData.find(
        (vj: any) => vj.condition_report_id === report.id // eslint-disable-line
      );
      allDamageFlags.push({
        id: area.id,
        reportId: report.id,
        propertyId: report.property_id,
        bookingId: report.booking_id,
        brandName: booking?.brand_name ?? "Unknown",
        areaName: area.area_name,
        condition: area.condition,
        notes: area.notes,
        flaggedDate: report.submitted_at?.split("T")[0] ?? report.created_at.split("T")[0],
        tradeNeeded: vendorJob?.trade ?? null,
        vendorJobId: vendorJob?.id ?? null,
        vendorJobStatus: vendorJob?.status ?? null,
        vendorName: vendorJob?.vendors?.name ?? null
      });
    }
  }

  const rows: TimelineRow[] = properties.map((property) => {
    const cells: TimelineCell[] = days.map((iso) => {
      const overlapping = bookings.filter(
        (b) =>
          b.property_id === property.id &&
          isoBetween(iso, b.check_in_date, b.check_out_date)
      );
      const primary = overlapping[0] ?? null;

      let state: TimelineCell["state"] = "empty";
      let eventType: "checkin" | "checkout" | "transition" | null = null;
      if (primary) {
        const isCi = primary.check_in_date === iso;
        const isCo = primary.check_out_date === iso;
        if (isCi && isCo) { state = "transition"; eventType = "transition"; }
        else if (isCi) { state = "checkin"; eventType = "checkin"; }
        else if (isCo) { state = "checkout"; eventType = "checkout"; }
        else state = "occupied";
      }

      const hasUnassignedShift = shifts.some(
        (s) =>
          s.property_id === property.id &&
          s.date === iso &&
          s.assigned_bh_id === null &&
          s.status === "open"
      );
      const hasUnconfirmedClean = cleans.some(
        (c) =>
          c.property_id === property.id &&
          c.date === iso &&
          (c.status === "pending" || c.status === "dispatched")
      );

      const cellDamageFlags = allDamageFlags.filter(
        (d) => d.propertyId === property.id && d.flaggedDate === iso
      );

      // Build event detail for clickable events
      let eventDetail: EventDetail | null = null;
      if (primary && eventType) {
        const bookingShifts = shifts.filter((s) => s.booking_id === primary.id);
        const bookingCleans = cleans.filter((c) => c.booking_id === primary.id);
        const bookingDamage = allDamageFlags.filter((d) => d.bookingId === primary.id);
        eventDetail = {
          bookingId: primary.id,
          externalId: primary.external_id,
          brandName: primary.brand_name,
          brandEmail: primary.brand_contact_email,
          brandPhone: primary.brand_contact_phone,
          propertyName: property.name,
          checkInDate: primary.check_in_date,
          checkOutDate: primary.check_out_date,
          ttvPence: primary.ttv_pence,
          eventType,
          shifts: bookingShifts.map((s) => ({
            id: s.id,
            type: s.type,
            status: s.status,
            assignedBhName: null, // Would need a join to auth.users
            startTime: s.start_time,
            endTime: s.end_time
          })),
          cleans: bookingCleans.map((c) => ({
            id: c.id,
            type: c.type,
            status: c.status,
            assignedCleanerName: null,
            timeWindow: c.time_window
          })),
          damageFlags: bookingDamage
        };
      }

      return {
        date: iso,
        propertyId: property.id,
        state,
        brandName: primary?.brand_name ?? null,
        bookingId: primary?.id ?? null,
        bookingStatus: primary?.status ?? null,
        hasUnassignedShift,
        hasUnconfirmedClean,
        hasDamageFlag: cellDamageFlags.length > 0,
        damageCount: cellDamageFlags.length,
        eventDetail
      };
    });
    return { property, cells };
  });

  const primeRows = rows.filter((r) => r.property.tier === "prime");

  const twoDaysOut = addDaysIso(windowStart, 2);
  const unassignedShiftsNext48h = shifts.filter(
    (s) =>
      s.assigned_bh_id === null &&
      s.status === "open" &&
      s.date >= windowStart &&
      s.date <= twoDaysOut
  ).length;

  const sevenDaysAgo = addDaysIso(windowStart, -7);
  const recentlyCompleted = bookings.filter(
    (b) => b.check_out_date >= sevenDaysAgo && b.check_out_date < windowStart
  );
  let overdueReports = 0;
  if (recentlyCompleted.length > 0) {
    const ids = recentlyCompleted.map((b) => b.id);
    const coReportsRes = await supabase
      .from("condition_reports")
      .select("booking_id, type, status")
      .in("booking_id", ids)
      .eq("type", "check_out");
    const coReportRows: Pick<Tables<"condition_reports">, "booking_id" | "type" | "status">[] =
      coReportsRes.data ?? [];
    const haveCoReport = new Set(
      coReportRows
        .filter((r) => r.status === "submitted" || r.status === "reviewed")
        .map((r) => r.booking_id)
    );
    overdueReports = recentlyCompleted.filter((b) => !haveCoReport.has(b.id)).length;
  }

  const unresolvedDamageFlags = allDamageFlags.filter((d) => !d.vendorJobId).length;

  const flags: RedFlags = {
    unassignedShiftsNext48h,
    overdueReports,
    depositsApproachingDeadline: deposits.length,
    unresolvedDamageFlags
  };

  const health: PropertyHealth[] = properties.map((property) => {
    const propBookings = bookings.filter((b) => b.property_id === property.id);
    const activeBookings = propBookings.filter((b) =>
      isoBetween(windowStart, b.check_in_date, b.check_out_date)
    ).length;
    const upcomingCheckIns14d = propBookings.filter(
      (b) => b.check_in_date >= windowStart && b.check_in_date < windowEndExclusive
    ).length;
    const unassignedShifts14d = shifts.filter(
      (s) => s.property_id === property.id && s.assigned_bh_id === null && s.status === "open"
    ).length;
    const propDamageFlags = allDamageFlags.filter((d) => d.propertyId === property.id);
    return { property, activeBookings, upcomingCheckIns14d, unassignedShifts14d, damageFlags: propDamageFlags };
  });

  return {
    windowStart,
    days,
    rows,
    primeRows,
    flags,
    health,
    allDamageFlags,
    generatedAt: now.toISOString(),
    source: "supabase"
  };
}
