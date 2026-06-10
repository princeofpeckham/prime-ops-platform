"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";
import type { TradeType } from "@/lib/calendar/types";

const TRADES: TradeType[] = [
  "signage",
  "blinds",
  "painting",
  "plumbing",
  "electrical",
  "cleaning",
  "security",
  "general"
];

function parseTrade(v: FormDataEntryValue | null): TradeType | null {
  const s = String(v ?? "").trim();
  return (TRADES as string[]).includes(s) ? (s as TradeType) : null;
}

// Create a maintenance job. Status defaults to 'unscheduled'; if a date is
// supplied up front we mark it 'scheduled'.
export async function createMaintenance(formData: FormData): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const propertyId = String(formData.get("property_id") ?? "").trim();
  if (!propertyId) throw new Error("Property is required");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const scheduledDate = String(formData.get("scheduled_date") ?? "").trim() || null;

  const { error } = await supabase.from("maintenance_jobs").insert({
    org_id: orgId,
    property_id: propertyId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    trade: parseTrade(formData.get("trade")),
    scheduled_date: scheduledDate,
    status: scheduledDate ? "scheduled" : "unscheduled"
  });
  if (error) throw new Error(error.message);

  revalidatePath("/calendar");
}

// Put an unscheduled job on the calendar.
export async function scheduleMaintenance(id: string, dateIso: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const date = dateIso.trim();
  if (!date) throw new Error("A date is required to schedule");

  const { error } = await supabase
    .from("maintenance_jobs")
    .update({ scheduled_date: date, status: "scheduled" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/calendar");
}

// Mark a job done, stamping completed_at now.
export async function completeMaintenance(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { error } = await supabase
    .from("maintenance_jobs")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/calendar");
}
