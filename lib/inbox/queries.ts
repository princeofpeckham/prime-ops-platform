// Live inbox data from Supabase. RLS scopes everything to the caller's org.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { toColumns } from "./stages";
import type { EnquiryItem, InboxData, PropertyOption, TimelineEvent } from "./types";

export async function fetchInboxFromSupabase(now: Date = new Date()): Promise<InboxData> {
  const supabase = createSupabaseServerClient();

  const [enquiriesRes, propertiesRes, eventsRes] = await Promise.all([
    supabase.from("enquiries").select("*").order("updated_at", { ascending: false }),
    supabase.from("properties").select("id,name").order("name"),
    supabase.from("enquiry_events").select("*").order("created_at", { ascending: true })
  ]);

  const enquiries: Tables<"enquiries">[] = enquiriesRes.data ?? [];
  const properties: PropertyOption[] = (propertiesRes.data ?? []).map((p) => ({ id: p.id, name: p.name }));
  const events: Tables<"enquiry_events">[] = eventsRes.data ?? [];

  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const eventsByEnquiry = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const list = eventsByEnquiry.get(ev.enquiry_id) ?? [];
    list.push({ id: ev.id, kind: ev.kind, body: ev.body, createdAt: ev.created_at });
    eventsByEnquiry.set(ev.enquiry_id, list);
  }

  const items: EnquiryItem[] = enquiries.map((e) => ({
    id: e.id,
    brandOrTenantName: e.brand_or_tenant_name,
    contactEmail: e.contact_email,
    contactPhone: e.contact_phone,
    valuePence: e.value_pence,
    requestedStartDate: e.requested_start_date,
    requestedEndDate: e.requested_end_date,
    propertyId: e.property_id,
    propertyName: e.property_id ? propertyNameById.get(e.property_id) ?? null : null,
    requestedArea: e.requested_area,
    stage: e.stage,
    source: e.source,
    bookingId: e.booking_id,
    summary: e.summary,
    nextAction: e.next_action,
    needsReview: e.needs_review,
    updatedAt: e.updated_at,
    events: eventsByEnquiry.get(e.id) ?? []
  }));

  const totalValuePence = items
    .filter((it) => it.stage !== "lost")
    .reduce((sum, it) => sum + (it.valuePence ?? 0), 0);

  return {
    columns: toColumns(items),
    properties,
    totalValuePence,
    needsReviewCount: items.filter((it) => it.needsReview).length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
