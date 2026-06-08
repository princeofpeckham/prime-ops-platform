// Gmail ingestion: fetch recent [PLUS] messages, parse with the deterministic
// parser, and upsert enquiries. Runs server-side with the service-role client
// (no user session in cron), so it writes directly. Idempotent by message id,
// and deduped per booking by (brand + start date) so the many emails about one
// booking collapse into one card.
//
// Single-org for the prototype (Appear Here). The per-org email-account model
// comes with multi-landlord onboarding; the label + org are env-config for now.

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { parseEmail, type PropertyRef } from "./parse";
import { getAccessToken, listLabelMessageIds, getMessage } from "./gmail";

export type IngestResult = {
  fetched: number;
  created: number;
  linked: number;
  ignored: number;
  duplicates: number;
};

const DEFAULT_ORG = "a0000000-0000-4000-8000-000000000001";
const DEFAULT_LABEL = "Label_4254955982593494591"; // [PLUS]

export async function ingestGmail(max = 25): Promise<IngestResult> {
  const orgId = process.env.PRIME_DEFAULT_ORG_ID ?? DEFAULT_ORG;
  const labelId = process.env.GMAIL_INGEST_LABEL_ID ?? DEFAULT_LABEL;
  const supa = createSupabaseServiceRoleClient();
  const fallbackYear = new Date().getUTCFullYear();

  const { data: props } = await supa.from("properties").select("id,name,address").eq("org_id", orgId);
  const refs: PropertyRef[] = (props ?? []).map((p) => ({ id: p.id, name: p.name, address: p.address }));

  const token = await getAccessToken();
  const ids = await listLabelMessageIds(token, labelId, max);

  const result: IngestResult = { fetched: ids.length, created: 0, linked: 0, ignored: 0, duplicates: 0 };

  for (const id of ids) {
    const { data: seen } = await supa
      .from("email_messages")
      .select("id")
      .eq("org_id", orgId)
      .eq("source", "gmail")
      .eq("external_message_id", id)
      .maybeSingle();
    if (seen) { result.duplicates++; continue; }

    const msg = await getMessage(token, id);
    const parsed = parseEmail({ sender: msg.from, subject: msg.subject, body: msg.body }, refs, fallbackYear);

    const logRaw = (status: "ignored" | "parsed", enquiryId: string | null) =>
      supa.from("email_messages").insert({
        org_id: orgId, source: "gmail", external_message_id: id, thread_id: msg.threadId,
        from_address: msg.from, to_address: msg.to, subject: msg.subject,
        body_text: status === "parsed" ? msg.body : null, received_at: msg.receivedAt,
        status, classified_kind: parsed.kind, parsed_reference: parsed.reference, enquiry_id: enquiryId
      });

    const stage = parsed.stage ?? (parsed.kind === "message" ? "request" : null);
    if (parsed.ignore || !stage) { await logRaw("ignored", null); result.ignored++; continue; }

    // Dedup per booking: same brand + start date already on the board -> link, do not duplicate.
    let enquiryId: string | null = null;
    if (parsed.brand && parsed.startDate) {
      const { data: match } = await supa
        .from("enquiries")
        .select("id")
        .eq("org_id", orgId)
        .eq("brand_or_tenant_name", parsed.brand)
        .eq("requested_start_date", parsed.startDate)
        .neq("stage", "lost")
        .maybeSingle();
      if (match) enquiryId = match.id;
    }

    if (enquiryId) {
      await logRaw("parsed", enquiryId);
      await supa.from("enquiry_events").insert({ org_id: orgId, enquiry_id: enquiryId, kind: "email_in", body: msg.subject });
      result.linked++;
      continue;
    }

    const { data: enq } = await supa
      .from("enquiries")
      .insert({
        org_id: orgId,
        brand_or_tenant_name: parsed.brand ?? "(unknown)",
        value_pence: parsed.valuePence,
        requested_start_date: parsed.startDate,
        requested_end_date: parsed.endDate,
        property_id: parsed.propertyId,
        requested_area: parsed.propertyId ? null : parsed.propertyAddress,
        stage,
        source: "email",
        summary: msg.subject,
        needs_review: parsed.needsReview
      })
      .select("id")
      .single();

    if (enq) {
      await logRaw("parsed", enq.id);
      await supa.from("enquiry_events").insert({ org_id: orgId, enquiry_id: enq.id, kind: "email_in", body: msg.subject });
      result.created++;
    }
  }

  return result;
}
