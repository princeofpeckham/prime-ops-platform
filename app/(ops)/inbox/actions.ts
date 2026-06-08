"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";
import { buildOpsForBooking } from "@/lib/bookings/ops";
import type { EnquiryStage } from "@/lib/inbox/types";

function toPence(pounds: string): number | null {
  const n = Number(pounds);
  if (!pounds || Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

function nullableDate(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createEnquiry(formData: FormData): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const name = String(formData.get("brand_or_tenant_name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const propertyId = String(formData.get("property_id") ?? "").trim() || null;

  const { error } = await supabase.from("enquiries").insert({
    org_id: orgId,
    brand_or_tenant_name: name,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
    contact_phone: String(formData.get("contact_phone") ?? "").trim() || null,
    value_pence: toPence(String(formData.get("value_pounds") ?? "")),
    requested_start_date: nullableDate(formData.get("requested_start_date")),
    requested_end_date: nullableDate(formData.get("requested_end_date")),
    property_id: propertyId,
    requested_area: String(formData.get("requested_area") ?? "").trim() || null,
    source: "manual",
    summary: String(formData.get("summary") ?? "").trim() || null
  });
  if (error) throw new Error(error.message);

  revalidatePath("/inbox");
}

export async function moveStage(enquiryId: string, stage: EnquiryStage): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { error } = await supabase.from("enquiries").update({ stage }).eq("id", enquiryId);
  if (error) throw new Error(error.message);

  await supabase.from("enquiry_events").insert({
    org_id: orgId,
    enquiry_id: enquiryId,
    kind: "stage_change",
    body: `Moved to ${stage}`
  });

  revalidatePath("/inbox");
}

export async function addNote(enquiryId: string, body: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");
  const trimmed = body.trim();
  if (!trimmed) return;

  const { error } = await supabase.from("enquiry_events").insert({
    org_id: orgId,
    enquiry_id: enquiryId,
    kind: "note",
    body: trimmed
  });
  if (error) throw new Error(error.message);

  revalidatePath("/inbox");
}

// Promote an enquiry into a real booking and link the two.
// Requires a property and both requested dates.
export async function promoteToBooking(enquiryId: string): Promise<{ ok: boolean; message?: string }> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) return { ok: false, message: "No active organization" };

  const { data: enquiry, error: readErr } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", enquiryId)
    .maybeSingle();
  if (readErr || !enquiry) return { ok: false, message: "Enquiry not found" };
  if (enquiry.booking_id) return { ok: false, message: "Already linked to a booking" };
  if (!enquiry.property_id) return { ok: false, message: "Set a property before promoting" };
  if (!enquiry.requested_start_date || !enquiry.requested_end_date) {
    return { ok: false, message: "Set requested dates before promoting" };
  }

  const externalId = `ENQ-${enquiryId.slice(0, 8).toUpperCase()}`;

  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      org_id: orgId,
      external_id: externalId,
      property_id: enquiry.property_id,
      brand_name: enquiry.brand_or_tenant_name,
      brand_contact_email: enquiry.contact_email,
      brand_contact_phone: enquiry.contact_phone,
      check_in_date: enquiry.requested_start_date,
      check_out_date: enquiry.requested_end_date,
      ttv_pence: enquiry.value_pence ?? 0,
      status: "confirmed",
      special_instructions: enquiry.summary
    })
    .select("id")
    .single();
  if (bookingErr || !booking) return { ok: false, message: bookingErr?.message ?? "Could not create booking" };

  // Auto-create the check-in/check-out shifts and pre/post cleans for the booking.
  const ops = buildOpsForBooking({
    id: booking.id,
    org_id: orgId,
    property_id: enquiry.property_id,
    check_in_date: enquiry.requested_start_date,
    check_out_date: enquiry.requested_end_date,
    brand_name: enquiry.brand_or_tenant_name
  });
  await supabase.from("shifts").insert(ops.shifts);
  await supabase.from("cleaning_jobs").insert(ops.cleans);

  await supabase
    .from("enquiries")
    .update({ booking_id: booking.id, stage: "in_offer" })
    .eq("id", enquiryId);

  await supabase.from("enquiry_events").insert({
    org_id: orgId,
    enquiry_id: enquiryId,
    kind: "note",
    body: `Promoted to booking ${externalId}`
  });

  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  return { ok: true };
}
