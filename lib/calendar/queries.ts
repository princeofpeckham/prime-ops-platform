// Live calendar data from Supabase. RLS scopes everything to the caller's org.
// Aggregates three sources (shifts, cleaning_jobs, maintenance_jobs) into one
// flat event list, plus the full maintenance backlog for the management panel.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { addDaysIso, londonToday } from "@/lib/utils";
import type {
  CalendarData,
  CalendarEvent,
  MaintenanceItem,
  PropertyOption,
  Tenancy
} from "./types";

// Trim "08:45:00" -> "08:45". Leaves windows like "17:00 onwards" untouched.
function shortTime(raw: string | null): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : raw;
}

export async function fetchCalendarFromSupabase(now: Date = new Date()): Promise<CalendarData> {
  const supabase = createSupabaseServerClient();

  // Pull a generous window around today so prev/next month navigation has data
  // without a refetch: 45 days back, 90 forward.
  const today = londonToday(now);
  const windowStart = addDaysIso(today, -45);
  const windowEndExclusive = addDaysIso(today, 90);

  const [propsRes, bookingsRes, shiftsRes, cleansRes, maintenanceRes] = await Promise.all([
    supabase.from("properties").select("id,name,tier").order("name"),
    // Bookings overlapping the window become continuous tenancy bars.
    supabase
      .from("bookings")
      .select("*")
      .neq("status", "cancelled")
      .gte("check_out_date", windowStart)
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
    // Maintenance: fetch all so the panel can show unscheduled rows too. Only the
    // scheduled ones inside the window become calendar events.
    supabase.from("maintenance_jobs").select("*").order("created_at", { ascending: false })
  ]);

  const properties: PropertyOption[] = (propsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier
  }));
  const bookings: Tables<"bookings">[] = bookingsRes.data ?? [];
  const shifts: Tables<"shifts">[] = shiftsRes.data ?? [];
  const cleans: Tables<"cleaning_jobs">[] = cleansRes.data ?? [];
  const maintenanceRows: Tables<"maintenance_jobs">[] = maintenanceRes.data ?? [];

  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  // Bookings span their entire occupied range, check-in to check-out inclusive.
  const tenancies: Tenancy[] = bookings.map((b) => ({
    bookingId: b.id,
    propertyId: b.property_id,
    propertyName: propertyNameById.get(b.property_id) ?? null,
    brandName: b.brand_name,
    startDate: b.check_in_date,
    endDate: b.check_out_date
  }));

  const events: CalendarEvent[] = [];

  for (const s of shifts) {
    const kind =
      s.type === "check_in" ? "check_in" : s.type === "check_out" ? "check_out" : "viewing";
    events.push({
      id: `shift-${s.id}`,
      kind,
      date: s.date,
      propertyId: s.property_id,
      propertyName: propertyNameById.get(s.property_id) ?? null,
      // shifts carry the brand in notes (see lib/bookings/ops.ts).
      title: s.notes?.trim() || (kind === "viewing" ? "Viewing" : "Booking"),
      time: shortTime(s.start_time),
      trade: null,
      maintenanceStatus: null,
      cleanType: null
    });
  }

  for (const c of cleans) {
    events.push({
      id: `clean-${c.id}`,
      kind: "clean",
      date: c.date,
      propertyId: c.property_id,
      propertyName: propertyNameById.get(c.property_id) ?? null,
      title: c.type === "pre_clean" ? "Pre-clean" : c.type === "post_clean" ? "Post-clean" : "Deep clean",
      time: shortTime(c.time_window),
      trade: null,
      maintenanceStatus: null,
      cleanType: c.type
    });
  }

  for (const m of maintenanceRows) {
    // Only scheduled maintenance appears on the grid. Unscheduled rows live in
    // the panel only.
    if (!m.scheduled_date) continue;
    events.push({
      id: `maint-${m.id}`,
      kind: "maintenance",
      date: m.scheduled_date,
      propertyId: m.property_id,
      propertyName: propertyNameById.get(m.property_id) ?? null,
      title: m.title,
      time: shortTime(m.time_window),
      trade: m.trade,
      maintenanceStatus: m.status,
      cleanType: null
    });
  }

  const maintenance: MaintenanceItem[] = maintenanceRows.map((m) => ({
    id: m.id,
    propertyId: m.property_id,
    propertyName: propertyNameById.get(m.property_id) ?? null,
    title: m.title,
    description: m.description,
    trade: m.trade,
    status: m.status,
    scheduledDate: m.scheduled_date,
    completedAt: m.completed_at,
    createdAt: m.created_at
  }));

  return {
    events,
    tenancies,
    maintenance,
    properties,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
