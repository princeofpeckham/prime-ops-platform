// Live cleaning data from Supabase. RLS scopes everything to the caller's org.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { CleaningData, CleaningJobItem } from "./types";

export async function fetchCleaningFromSupabase(now: Date = new Date()): Promise<CleaningData> {
  const supabase = createSupabaseServerClient();

  const [jobsRes, propertiesRes] = await Promise.all([
    supabase.from("cleaning_jobs").select("*").order("date", { ascending: true }),
    supabase.from("properties").select("id,name").order("name")
  ]);

  const jobs: Tables<"cleaning_jobs">[] = jobsRes.data ?? [];
  const properties: { id: string; name: string }[] = propertiesRes.data ?? [];
  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const items: CleaningJobItem[] = jobs.map((j) => ({
    id: j.id,
    date: j.date,
    timeWindow: j.time_window,
    propertyId: j.property_id,
    propertyName: propertyNameById.get(j.property_id) ?? null,
    type: j.type,
    ratePence: j.rate_pence,
    status: j.status,
    smsSentAt: j.sms_sent_at,
    confirmedAt: j.confirmed_at,
    completedAt: j.completed_at,
    notes: j.notes
  }));

  return buildData(items, "supabase", now);
}

export function buildData(
  items: CleaningJobItem[],
  source: CleaningData["source"],
  now: Date
): CleaningData {
  const totalRatePence = items
    .filter((it) => it.status !== "cancelled")
    .reduce((sum, it) => sum + it.ratePence, 0);
  return {
    jobs: items,
    totalRatePence,
    pendingCount: items.filter((it) => it.status === "pending").length,
    source,
    generatedAt: now.toISOString()
  };
}
