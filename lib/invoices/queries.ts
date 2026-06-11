// Live invoice data from Supabase. RLS scopes everything to the caller's org.
// Property names and booking refs/brands are joined via separate fetches and
// id maps, matching the deposits feature.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { parseLineItems } from "./logic";
import type { InvoiceItem, InvoicesData } from "./types";

type BookingRef = Pick<Tables<"bookings">, "id" | "brand_name" | "external_id">;
type PropertyRef = Pick<Tables<"properties">, "id" | "name">;

function toItem(
  inv: Tables<"invoices">,
  bookingById: Map<string, BookingRef>,
  propertyNameById: Map<string, string>
): InvoiceItem {
  const booking = inv.booking_id ? bookingById.get(inv.booking_id) : undefined;
  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    propertyId: inv.property_id,
    propertyName: propertyNameById.get(inv.property_id) ?? null,
    bookingId: inv.booking_id,
    bookingRef: booking?.external_id ?? null,
    brandName: booking?.brand_name ?? null,
    billedToName: inv.billed_to_name,
    billedToAddress: inv.billed_to_address,
    issuedDate: inv.issued_date,
    lineItems: parseLineItems(inv.line_items),
    subtotalPence: inv.subtotal_pence,
    vatPence: inv.vat_pence,
    totalPence: inv.total_pence,
    status: inv.status,
    notes: inv.notes,
    createdAt: inv.created_at
  };
}

export async function fetchInvoicesFromSupabase(now: Date = new Date()): Promise<InvoicesData> {
  const supabase = createSupabaseServerClient();

  const [invoicesRes, bookingsRes, propertiesRes] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("bookings").select("id,brand_name,external_id"),
    supabase.from("properties").select("id,name")
  ]);

  const invoices: Tables<"invoices">[] = invoicesRes.data ?? [];
  const bookings: BookingRef[] = bookingsRes.data ?? [];
  const properties: PropertyRef[] = propertiesRes.data ?? [];

  const bookingById = new Map(bookings.map((b) => [b.id, b]));
  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const items: InvoiceItem[] = invoices.map((inv) =>
    toItem(inv, bookingById, propertyNameById)
  );

  return {
    items,
    issuedCount: items.filter((it) => it.status === "issued").length,
    totalIssuedPence: items
      .filter((it) => it.status !== "void")
      .reduce((sum, it) => sum + it.totalPence, 0),
    source: "supabase",
    generatedAt: now.toISOString()
  };
}

export async function fetchInvoiceFromSupabase(id: string): Promise<InvoiceItem | null> {
  const supabase = createSupabaseServerClient();

  const invoiceRes = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  const invoice: Tables<"invoices"> | null = invoiceRes.data;
  if (!invoice) return null;

  const [bookingRes, propertyRes] = await Promise.all([
    invoice.booking_id
      ? supabase.from("bookings").select("id,brand_name,external_id").eq("id", invoice.booking_id).maybeSingle()
      : Promise.resolve({ data: null as BookingRef | null }),
    supabase.from("properties").select("id,name").eq("id", invoice.property_id).maybeSingle()
  ]);

  const booking: BookingRef | null = bookingRes.data;
  const property: PropertyRef | null = propertyRes.data;

  const bookingById = new Map<string, BookingRef>(booking ? [[booking.id, booking]] : []);
  const propertyNameById = new Map<string, string>(property ? [[property.id, property.name]] : []);

  return toItem(invoice, bookingById, propertyNameById);
}
