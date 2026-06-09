// Live flags data from Supabase. RLS scopes everything to the caller's org.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { isOpen, toColumns } from "./statuses";
import type { FlagItem, FlagsData, PropertyOption, VendorOption } from "./types";

export async function fetchFlagsFromSupabase(now: Date = new Date()): Promise<FlagsData> {
  const supabase = createSupabaseServerClient();

  const [flagsRes, propertiesRes, vendorsRes] = await Promise.all([
    supabase.from("property_flags").select("*").order("created_at", { ascending: false }),
    supabase.from("properties").select("id,name").order("name"),
    supabase.from("vendors").select("id,name,trade,coverage_area,is_approved").order("name")
  ]);

  const flags: Tables<"property_flags">[] = flagsRes.data ?? [];
  const properties: PropertyOption[] = (propertiesRes.data ?? []).map((p) => ({ id: p.id, name: p.name }));
  const vendorRows: Pick<Tables<"vendors">, "id" | "name" | "trade" | "coverage_area" | "is_approved">[] =
    vendorsRes.data ?? [];

  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const vendors: VendorOption[] = vendorRows
    .filter((v) => v.is_approved)
    .map((v) => ({ id: v.id, name: v.name, trade: v.trade, coverageArea: v.coverage_area }));

  const items: FlagItem[] = flags.map((f) => ({
    id: f.id,
    propertyId: f.property_id,
    propertyName: propertyNameById.get(f.property_id) ?? null,
    title: f.title,
    description: f.description,
    trade: f.trade,
    severity: f.severity,
    source: f.source,
    status: f.status,
    photoCount: f.photos.length,
    vendorJobId: f.vendor_job_id,
    assignedTo: f.assigned_to,
    createdAt: f.created_at,
    resolvedAt: f.resolved_at
  }));

  const openItems = items.filter((it) => isOpen(it.status));

  return {
    columns: toColumns(items),
    properties,
    vendors,
    openCount: openItems.length,
    urgentCount: openItems.filter((it) => it.severity === "urgent").length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
