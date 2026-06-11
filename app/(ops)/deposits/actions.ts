"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/lib/supabase/types";
import { getActiveOrgId } from "@/lib/auth/org";
import { londonToday } from "@/lib/utils";
import { computeTotals, sanitiseLineItems } from "@/lib/invoices/logic";
import type { LineItem } from "@/lib/invoices/logic";

// Propose a deduction against a deposit: records the amount and reason and moves
// the deposit into deduction_proposed for ops sign off.
export async function proposeDeduction(
  id: string,
  amountPence: number,
  reason: string
): Promise<void> {
  const supabase = createSupabaseServerClient();

  const amount = Number.isFinite(amountPence) ? Math.max(0, Math.round(amountPence)) : 0;
  const trimmed = reason.trim();

  const { error } = await supabase
    .from("deposits")
    .update({
      status: "deduction_proposed",
      deduction_amount_pence: amount,
      deduction_reason: trimmed || null
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/deposits");
}

// Approve a deposit decision, stamping the approval time.
export async function approveDeposit(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("deposits")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/deposits");
}

// Mark a deposit as processed (refund or deduction actioned), stamping the time.
export async function processDeposit(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("deposits")
    .update({ status: "processed", processed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/deposits");
}

// Create a deposit invoice from ops-built line items. Claims the next invoice
// number for the property atomically via the next_invoice_number SQL function,
// computes the totals, inserts the invoice, and (when the deposit is still
// pending review) proposes the invoice total as the deduction.
export async function createInvoice(depositId: string, lineItems: LineItem[]): Promise<void> {
  const supabase = createSupabaseServerClient();

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organisation for the current user.");

  const cleaned = sanitiseLineItems(lineItems);
  if (cleaned.length === 0) throw new Error("An invoice needs at least one line item.");

  // Load the deposit, then its booking and property in parallel.
  const depositRes = await supabase
    .from("deposits")
    .select("*")
    .eq("id", depositId)
    .maybeSingle();
  const deposit: Tables<"deposits"> | null = depositRes.data;
  if (!deposit) throw new Error("Deposit not found.");

  const [bookingRes, propertyRes] = await Promise.all([
    supabase.from("bookings").select("*").eq("id", deposit.booking_id).maybeSingle(),
    supabase.from("properties").select("*").eq("id", deposit.property_id).maybeSingle()
  ]);
  const booking: Tables<"bookings"> | null = bookingRes.data;
  const property: Tables<"properties"> | null = propertyRes.data;
  if (!booking) throw new Error("Booking not found for this deposit.");
  if (!property) throw new Error("Property not found for this deposit.");

  // Atomically claim the next invoice number for the property.
  const numberRes = await supabase.rpc("next_invoice_number", { p_property: property.id });
  if (numberRes.error) throw new Error(numberRes.error.message);
  const invoiceNumber: string = numberRes.data ?? "";
  if (!invoiceNumber) throw new Error("Could not claim an invoice number for this property.");

  const totals = computeTotals(cleaned);
  const lineItemsJson: Json = cleaned.map((line) => ({
    item: line.item,
    quantity: line.quantity,
    ratePence: line.ratePence,
    waived: line.waived
  }));

  const { error: insertError } = await supabase.from("invoices").insert({
    org_id: orgId,
    invoice_number: invoiceNumber,
    billed_to_name: booking.brand_name,
    issued_date: londonToday(),
    status: "issued",
    booking_id: booking.id,
    deposit_id: deposit.id,
    property_id: property.id,
    line_items: lineItemsJson,
    subtotal_pence: totals.subtotalPence,
    vat_pence: totals.vatPence,
    total_pence: totals.totalPence
  });
  if (insertError) throw new Error(insertError.message);

  // A freshly invoiced deposit that was awaiting review now has a concrete
  // deduction on the table: move it along with the invoice total proposed.
  if (deposit.status === "pending_review") {
    const { error: updateError } = await supabase
      .from("deposits")
      .update({
        status: "deduction_proposed",
        deduction_amount_pence: totals.totalPence
      })
      .eq("id", deposit.id);
    if (updateError) throw new Error(updateError.message);
  }

  revalidatePath("/deposits");
  revalidatePath("/invoices");
}
