// Live vendors data from Supabase. RLS scopes everything to the caller's org.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { toColumns } from "./status";
import type {
  PropertyOption,
  VendorItem,
  VendorJobItem,
  VendorsData
} from "./types";

export async function fetchVendorsFromSupabase(now: Date = new Date()): Promise<VendorsData> {
  const supabase = createSupabaseServerClient();

  const [vendorsRes, jobsRes, propertiesRes] = await Promise.all([
    supabase.from("vendors").select("*").order("name"),
    supabase.from("vendor_jobs").select("*").order("created_at", { ascending: false }),
    supabase.from("properties").select("id,name").order("name")
  ]);

  const vendorRows: Tables<"vendors">[] = vendorsRes.data ?? [];
  const jobRows: Tables<"vendor_jobs">[] = jobsRes.data ?? [];
  const properties: PropertyOption[] = (propertiesRes.data ?? []).map((p) => ({ id: p.id, name: p.name }));

  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));
  const vendorNameById = new Map(vendorRows.map((v) => [v.id, v.name]));

  const vendors: VendorItem[] = vendorRows.map((v) => ({
    id: v.id,
    name: v.name,
    trade: v.trade,
    qualityRating: v.quality_rating,
    isApproved: v.is_approved,
    totalJobs: v.total_jobs,
    coverageArea: v.coverage_area,
    contactName: v.contact_name,
    contactEmail: v.contact_email,
    contactPhone: v.contact_phone
  }));

  const jobs: VendorJobItem[] = jobRows.map((j) => ({
    id: j.id,
    title: j.title,
    trade: j.trade,
    status: j.status,
    propertyId: j.property_id,
    propertyName: propertyNameById.get(j.property_id) ?? null,
    vendorId: j.vendor_id,
    vendorName: j.vendor_id ? vendorNameById.get(j.vendor_id) ?? null : null,
    quoteAmountPence: j.quote_amount_pence,
    actualAmountPence: j.actual_amount_pence,
    dueDate: j.due_date,
    chaseCount: j.chase_count
  }));

  return {
    vendors,
    columns: toColumns(jobs),
    properties,
    approvedCount: vendors.filter((v) => v.isApproved).length,
    openJobCount: jobs.filter((j) => j.status !== "completed").length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
