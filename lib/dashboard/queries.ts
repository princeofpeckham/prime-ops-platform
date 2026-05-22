// Supabase query path for the Ops Command Centre.
// Engaged when NEXT_PUBLIC_USE_MOCK_DATA is not "true".
// Once migrations land and seed data is in place, this becomes the live path.

import { addDaysIso, isoBetween, isoDateRange, londonToday } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type {
  DashboardData,
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

  const [propsRes, bookingsRes, shiftsRes, cleansRes, depositsRes] = await Promise.all([
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
      .lte("deadline_date", addDaysIso(windowStart, 3))
  ]);

  const properties: Tables<"properties">[]    = propsRes.data     ?? [];
  const bookings:   Tables<"bookings">[]      = bookingsRes.data  ?? [];
  const shifts:     Tables<"shifts">[]        = shiftsRes.data    ?? [];
  const cleans:     Tables<"cleaning_jobs">[] = cleansRes.data    ?? [];
  const deposits:   Tables<"deposits">[]      = depositsRes.data  ?? [];

  const rows: TimelineRow[] = properties.map((property) => {
    const cells: TimelineCell[] = days.map((iso) => {
      const overlapping = bookings.filter(
        (b) =>
          b.property_id === property.id &&
          isoBetween(iso, b.check_in_date, b.check_out_date)
      );
      const primary = overlapping[0] ?? null;

      let state: TimelineCell["state"] = "empty";
      if (primary) {
        const isCi = primary.check_in_date === iso;
        const isCo = primary.check_out_date === iso;
        if (isCi && isCo) state = "transition";
        else if (isCi) state = "checkin";
        else if (isCo) state = "checkout";
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

      return {
        date: iso,
        propertyId: property.id,
        state,
        brandName: primary?.brand_name ?? null,
        bookingId: primary?.id ?? null,
        bookingStatus: primary?.status ?? null,
        hasUnassignedShift,
        hasUnconfirmedClean
      };
    });
    return { property, cells };
  });

  const twoDaysOut = addDaysIso(windowStart, 2);
  const unassignedShiftsNext48h = shifts.filter(
    (s) =>
      s.assigned_bh_id === null &&
      s.status === "open" &&
      s.date >= windowStart &&
      s.date <= twoDaysOut
  ).length;

  // Overdue reports: bookings that ended in the last 7 days where no submitted
  // CO condition report exists. We approximate by fetching CO reports here.
  const sevenDaysAgo = addDaysIso(windowStart, -7);
  const recentlyCompleted = bookings.filter(
    (b) => b.check_out_date >= sevenDaysAgo && b.check_out_date < windowStart
  );
  let overdueReports = 0;
  if (recentlyCompleted.length > 0) {
    const ids = recentlyCompleted.map((b) => b.id);
    const reportsRes = await supabase
      .from("condition_reports")
      .select("booking_id, type, status")
      .in("booking_id", ids)
      .eq("type", "check_out");
    const reportRows: Pick<Tables<"condition_reports">, "booking_id" | "type" | "status">[] =
      reportsRes.data ?? [];
    const haveCoReport = new Set(
      reportRows
        .filter((r) => r.status === "submitted" || r.status === "reviewed")
        .map((r) => r.booking_id)
    );
    overdueReports = recentlyCompleted.filter((b) => !haveCoReport.has(b.id)).length;
  }

  const flags: RedFlags = {
    unassignedShiftsNext48h,
    overdueReports,
    depositsApproachingDeadline: deposits.length
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
    return { property, activeBookings, upcomingCheckIns14d, unassignedShifts14d };
  });

  return {
    windowStart,
    days,
    rows,
    flags,
    health,
    generatedAt: now.toISOString(),
    source: "supabase"
  };
}
