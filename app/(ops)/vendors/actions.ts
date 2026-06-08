"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";
import type { TablesInsert } from "@/lib/supabase/types";
import type { TradeType, VendorJobStatus } from "@/lib/vendors/types";

function toPence(pounds: string): number | null {
  const n = Number(pounds);
  if (!pounds || Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

function nullableDate(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createVendorJob(formData: FormData): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const propertyId = String(formData.get("property_id") ?? "").trim();
  if (!propertyId) throw new Error("Property is required");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const trade = String(formData.get("trade") ?? "").trim() as TradeType;
  if (!trade) throw new Error("Trade is required");

  const vendorId = String(formData.get("vendor_id") ?? "").trim() || null;

  const row: TablesInsert<"vendor_jobs"> = {
    org_id: orgId,
    property_id: propertyId,
    title,
    trade,
    vendor_id: vendorId,
    description: String(formData.get("description") ?? "").trim() || null,
    quote_amount_pence: toPence(String(formData.get("quote_pounds") ?? "")),
    due_date: nullableDate(formData.get("due_date")),
    status: "draft"
  };

  const { error } = await supabase.from("vendor_jobs").insert(row);
  if (error) throw new Error(error.message);

  revalidatePath("/vendors");
}

export async function updateVendorJob(
  id: string,
  patch: { status?: VendorJobStatus; quote_amount_pence?: number | null }
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const update: { status?: VendorJobStatus; quote_amount_pence?: number | null; updated_at: string } = {
    updated_at: new Date().toISOString()
  };
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.quote_amount_pence !== undefined) update.quote_amount_pence = patch.quote_amount_pence;

  const { error } = await supabase.from("vendor_jobs").update(update).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vendors");
}
