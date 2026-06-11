// Live cleaner data from Supabase. RLS scopes rows to the caller's org and
// role; on top of that we filter to jobs assigned to this cleaner (auth uid).

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { CleanerHistoryData, CleanerJobItem, CleanerJobsData } from "./types";

type PropertyRef = Pick<Tables<"properties">, "id" | "name" | "address" | "keynest_instructions">;
type BookingRef = Pick<Tables<"bookings">, "id" | "brand_name">;

// Hydrate a raw cleaning job with its space and brand context.
function toItem(
  j: Tables<"cleaning_jobs">,
  propertyById: Map<string, PropertyRef>,
  brandByBookingId: Map<string, string>
): CleanerJobItem {
  const property = propertyById.get(j.property_id);
  return {
    id: j.id,
    date: j.date,
    timeWindow: j.time_window,
    propertyId: j.property_id,
    propertyName: property?.name ?? null,
    propertyAddress: property?.address ?? null,
    keynestInstructions: property?.keynest_instructions ?? null,
    brandName: brandByBookingId.get(j.booking_id) ?? null,
    type: j.type,
    ratePence: j.rate_pence,
    status: j.status,
    notes: j.notes,
    confirmedAt: j.confirmed_at,
    completedAt: j.completed_at,
    completionPhotos: j.completion_photos ?? []
  };
}

// Look up the properties and bookings referenced by a set of jobs in two
// batched reads, then return maps keyed by id.
async function hydrateRefs(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  jobs: Tables<"cleaning_jobs">[]
): Promise<{ propertyById: Map<string, PropertyRef>; brandByBookingId: Map<string, string> }> {
  const propertyIds = [...new Set(jobs.map((j) => j.property_id))];
  const bookingIds = [...new Set(jobs.map((j) => j.booking_id))];

  const [propertiesRes, bookingsRes] = await Promise.all([
    propertyIds.length
      ? supabase.from("properties").select("id,name,address,keynest_instructions").in("id", propertyIds)
      : Promise.resolve({ data: [] as PropertyRef[] }),
    bookingIds.length
      ? supabase.from("bookings").select("id,brand_name").in("id", bookingIds)
      : Promise.resolve({ data: [] as BookingRef[] })
  ]);

  const properties: PropertyRef[] = propertiesRes.data ?? [];
  const bookings: BookingRef[] = bookingsRes.data ?? [];

  return {
    propertyById: new Map(properties.map((p) => [p.id, p])),
    brandByBookingId: new Map(bookings.map((b) => [b.id, b.brand_name]))
  };
}

async function authUid(
  supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function fetchCleanerJobsFromSupabase(now: Date = new Date()): Promise<CleanerJobsData> {
  const supabase = createSupabaseServerClient();
  const uid = await authUid(supabase);

  const empty: CleanerJobsData = {
    jobs: [],
    toConfirmCount: 0,
    source: "supabase",
    generatedAt: now.toISOString()
  };
  if (!uid) return empty;

  const jobsRes = await supabase
    .from("cleaning_jobs")
    .select("*")
    .eq("assigned_cleaner_id", uid)
    .in("status", ["pending", "dispatched", "confirmed"])
    .order("date", { ascending: true });

  const jobs: Tables<"cleaning_jobs">[] = jobsRes.data ?? [];
  if (jobs.length === 0) return empty;

  const { propertyById, brandByBookingId } = await hydrateRefs(supabase, jobs);
  const items = jobs.map((j) => toItem(j, propertyById, brandByBookingId));

  return {
    jobs: items,
    toConfirmCount: items.filter((it) => it.status === "dispatched").length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}

export async function fetchCleanerHistoryFromSupabase(now: Date = new Date()): Promise<CleanerHistoryData> {
  const supabase = createSupabaseServerClient();
  const uid = await authUid(supabase);

  const empty: CleanerHistoryData = {
    jobs: [],
    totalChargedPence: 0,
    completedCount: 0,
    source: "supabase",
    generatedAt: now.toISOString()
  };
  if (!uid) return empty;

  const jobsRes = await supabase
    .from("cleaning_jobs")
    .select("*")
    .eq("assigned_cleaner_id", uid)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  const jobs: Tables<"cleaning_jobs">[] = jobsRes.data ?? [];
  if (jobs.length === 0) return empty;

  const { propertyById, brandByBookingId } = await hydrateRefs(supabase, jobs);
  const items = jobs.map((j) => toItem(j, propertyById, brandByBookingId));

  return {
    jobs: items,
    totalChargedPence: items.reduce((sum, it) => sum + it.ratePence, 0),
    completedCount: items.length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
