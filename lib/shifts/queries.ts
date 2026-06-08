// Live shifts data from Supabase. RLS scopes everything to the caller's org.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { sortShifts } from "./status";
import type { PropertyOption, ShiftItem, ShiftsData } from "./types";

export async function fetchShiftsFromSupabase(now: Date = new Date()): Promise<ShiftsData> {
  const supabase = createSupabaseServerClient();

  const [shiftsRes, propertiesRes] = await Promise.all([
    supabase.from("shifts").select("*").order("date", { ascending: true }),
    supabase.from("properties").select("id,name").order("name")
  ]);

  const shifts: Tables<"shifts">[] = shiftsRes.data ?? [];
  const properties: PropertyOption[] = (propertiesRes.data ?? []).map((p) => ({ id: p.id, name: p.name }));

  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const items: ShiftItem[] = shifts.map((s) => ({
    id: s.id,
    date: s.date,
    startTime: s.start_time,
    endTime: s.end_time,
    propertyId: s.property_id,
    propertyName: propertyNameById.get(s.property_id) ?? null,
    type: s.type,
    brand: s.notes,
    ratePence: s.rate_pence,
    status: s.status,
    assignedBhId: s.assigned_bh_id,
    isAssigned: s.assigned_bh_id != null,
    isEscalated: s.is_escalated
  }));

  const sorted = sortShifts(items);

  return {
    shifts: sorted,
    properties,
    openCount: sorted.filter((it) => it.status === "open").length,
    escalatedCount: sorted.filter((it) => it.isEscalated).length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
