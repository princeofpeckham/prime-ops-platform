// Live brand host shift data from Supabase. RLS scopes everything to the
// caller's org and brandhost role, so we never filter org_id by hand.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { sortBySchedule } from "./status";
import type {
  MarketplaceData,
  MyShiftItem,
  MyShiftsData,
  OpenShiftItem
} from "./types";

// The marketplace of open shifts a brand host can apply to.
export async function fetchMarketplaceFromSupabase(now: Date = new Date()): Promise<MarketplaceData> {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const bhId = user?.id ?? null;

  const [shiftsRes, propertiesRes, applicationsRes] = await Promise.all([
    supabase.from("shifts").select("*").eq("status", "open").order("date", { ascending: true }),
    supabase.from("properties").select("id,name").order("name"),
    bhId
      ? supabase
          .from("shift_applications")
          .select("shift_id,status")
          .eq("bh_id", bhId)
          .eq("status", "pending")
      : Promise.resolve({ data: [] as { shift_id: string; status: string }[] })
  ]);

  const shifts: Tables<"shifts">[] = shiftsRes.data ?? [];
  const properties: { id: string; name: string }[] = propertiesRes.data ?? [];
  const applications: { shift_id: string; status: string }[] = applicationsRes.data ?? [];

  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));
  const appliedShiftIds = new Set(applications.map((a) => a.shift_id));

  const items: OpenShiftItem[] = shifts.map((s) => ({
    id: s.id,
    date: s.date,
    startTime: s.start_time,
    endTime: s.end_time,
    propertyId: s.property_id,
    propertyName: propertyNameById.get(s.property_id) ?? null,
    type: s.type,
    brand: s.notes,
    ratePence: s.rate_pence,
    isEscalated: s.is_escalated,
    hasApplied: appliedShiftIds.has(s.id)
  }));

  const sorted = sortBySchedule(items);

  return {
    shifts: sorted,
    appliedCount: sorted.filter((it) => it.hasApplied).length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}

// The shifts assigned to the signed in brand host, with space access notes.
export async function fetchMyShiftsFromSupabase(now: Date = new Date()): Promise<MyShiftsData> {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const bhId = user?.id ?? null;

  if (!bhId) {
    return { shifts: [], upcomingCount: 0, source: "supabase", generatedAt: now.toISOString() };
  }

  const [shiftsRes, propertiesRes] = await Promise.all([
    supabase
      .from("shifts")
      .select("*")
      .eq("assigned_bh_id", bhId)
      .order("date", { ascending: true }),
    supabase.from("properties").select("id,name,keynest_instructions").order("name")
  ]);

  const shifts: Tables<"shifts">[] = shiftsRes.data ?? [];
  const properties: Pick<Tables<"properties">, "id" | "name" | "keynest_instructions">[] =
    propertiesRes.data ?? [];

  const propertyById = new Map(properties.map((p) => [p.id, p]));

  const items: MyShiftItem[] = shifts.map((s) => {
    const property = propertyById.get(s.property_id);
    return {
      id: s.id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      propertyId: s.property_id,
      propertyName: property?.name ?? null,
      type: s.type,
      brand: s.notes,
      ratePence: s.rate_pence,
      isEscalated: s.is_escalated,
      keynestInstructions: property?.keynest_instructions ?? null
    };
  });

  const sorted = sortBySchedule(items);

  return {
    shifts: sorted,
    upcomingCount: sorted.length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
