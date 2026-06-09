"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";
import type { Enums } from "@/lib/supabase/types";

type FlagSeverity = Enums<"flag_severity">;
type TradeType = Enums<"trade_type">;

const VALID_SEVERITY: readonly FlagSeverity[] = ["low", "medium", "high", "urgent"];
const VALID_TRADE: readonly TradeType[] = [
  "signage",
  "blinds",
  "painting",
  "plumbing",
  "electrical",
  "cleaning",
  "security",
  "general"
];

function parseSeverity(v: FormDataEntryValue | null): FlagSeverity {
  const s = String(v ?? "").trim();
  return (VALID_SEVERITY as readonly string[]).includes(s) ? (s as FlagSeverity) : "medium";
}

function parseTrade(v: FormDataEntryValue | null): TradeType | null {
  const s = String(v ?? "").trim();
  return (VALID_TRADE as readonly string[]).includes(s) ? (s as TradeType) : null;
}

// Drop a Slack notification row for the ops channel, then best-effort ping n8n.
// Never throws: a failed webhook must not roll back the flag or job write.
async function notifyOps(args: {
  orgId: string;
  template: string;
  body: string;
  relatedType: string;
  relatedId: string;
}): Promise<void> {
  const supabase = createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  await supabase.from("notifications").insert({
    org_id: args.orgId,
    channel: "slack",
    recipient_address: "ops",
    template: args.template,
    body: args.body,
    related_type: args.relatedType,
    related_id: args.relatedId,
    status: "sent",
    sent_at: nowIso
  });

  const base = process.env.N8N_WEBHOOK_BASE_URL;
  if (!base) return;
  try {
    await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: args.template,
        summary: args.body,
        relatedType: args.relatedType,
        relatedId: args.relatedId,
        sentAt: nowIso
      })
    });
  } catch {
    // Webhook is fire-and-forget. Swallow any network error.
  }
}

// Raise a flag manually from ops. Source is always ops_manual here.
export async function raiseFlag(formData: FormData): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { data: { user } } = await supabase.auth.getUser();

  const propertyId = String(formData.get("property_id") ?? "").trim();
  if (!propertyId) throw new Error("Property is required");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const description = String(formData.get("description") ?? "").trim() || null;
  const trade = parseTrade(formData.get("trade"));
  const severity = parseSeverity(formData.get("severity"));

  const { data: flag, error } = await supabase
    .from("property_flags")
    .insert({
      org_id: orgId,
      property_id: propertyId,
      title,
      description,
      trade,
      severity,
      source: "ops_manual",
      status: "raised",
      raised_by: user?.id ?? null
    })
    .select("id")
    .single();
  if (error || !flag) throw new Error(error?.message ?? "Could not raise flag");

  await notifyOps({
    orgId,
    template: "flag",
    body: `New flag raised: ${title} (${severity})`,
    relatedType: "property_flag",
    relatedId: flag.id
  });

  revalidatePath("/flags");
}

// Triage a raised flag: set its trade and severity, advance to triaged.
export async function triageFlag(id: string, trade: TradeType, severity: FlagSeverity): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const safeTrade = (VALID_TRADE as readonly string[]).includes(trade) ? trade : "general";
  const safeSeverity = (VALID_SEVERITY as readonly string[]).includes(severity) ? severity : "medium";

  const { error } = await supabase
    .from("property_flags")
    .update({ trade: safeTrade, severity: safeSeverity, status: "triaged" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/flags");
}

// Spin a vendor job out of a flag, then link the two and mark the flag assigned.
export async function routeToVendor(id: string, vendorId: string): Promise<{ ok: boolean; message?: string }> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) return { ok: false, message: "No active organization" };

  const { data: flag, error: readErr } = await supabase
    .from("property_flags")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !flag) return { ok: false, message: "Flag not found" };
  if (flag.vendor_job_id) return { ok: false, message: "Already routed to a vendor" };

  // vendor_jobs.trade is required and non-null, so fall back to general.
  const jobTrade = flag.trade ?? "general";

  const { data: job, error: jobErr } = await supabase
    .from("vendor_jobs")
    .insert({
      org_id: orgId,
      property_id: flag.property_id,
      vendor_id: vendorId,
      title: flag.title,
      description: flag.description,
      trade: jobTrade,
      status: "draft"
    })
    .select("id")
    .single();
  if (jobErr || !job) return { ok: false, message: jobErr?.message ?? "Could not create vendor job" };

  const { error: linkErr } = await supabase
    .from("property_flags")
    .update({ vendor_job_id: job.id, status: "assigned" })
    .eq("id", id);
  if (linkErr) return { ok: false, message: linkErr.message };

  await notifyOps({
    orgId,
    template: "flag",
    body: `Flag routed to vendor: ${flag.title} (${jobTrade})`,
    relatedType: "property_flag",
    relatedId: id
  });

  revalidatePath("/flags");
  return { ok: true };
}

// Keep a flag in-house: mark assigned without creating a vendor job.
export async function assignToPerson(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { error } = await supabase
    .from("property_flags")
    .update({ status: "assigned" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/flags");
}

export async function resolveFlag(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { error } = await supabase
    .from("property_flags")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/flags");
}

export async function dismissFlag(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { error } = await supabase
    .from("property_flags")
    .update({ status: "dismissed" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/flags");
}
