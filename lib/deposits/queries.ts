// Live deposits data from Supabase. RLS scopes everything to the caller's org.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { isDueSoon, sortByUrgency } from "./status";
import type { DepositItem, DepositsData } from "./types";

export async function fetchDepositsFromSupabase(now: Date = new Date()): Promise<DepositsData> {
  const supabase = createSupabaseServerClient();

  const [depositsRes, bookingsRes, propertiesRes] = await Promise.all([
    supabase.from("deposits").select("*").order("deadline_date", { ascending: true }),
    supabase.from("bookings").select("id,brand_name"),
    supabase.from("properties").select("id,name")
  ]);

  const deposits: Tables<"deposits">[] = depositsRes.data ?? [];
  const bookings: Pick<Tables<"bookings">, "id" | "brand_name">[] = bookingsRes.data ?? [];
  const properties: Pick<Tables<"properties">, "id" | "name">[] = propertiesRes.data ?? [];

  const brandByBooking = new Map(bookings.map((b) => [b.id, b.brand_name]));
  const propertyNameById = new Map(properties.map((p) => [p.id, p.name]));

  const items: DepositItem[] = deposits.map((d) => ({
    id: d.id,
    bookingId: d.booking_id,
    propertyId: d.property_id,
    propertyName: propertyNameById.get(d.property_id) ?? null,
    brandName: brandByBooking.get(d.booking_id) ?? null,
    checkoutDate: d.checkout_date,
    deadlineDate: d.deadline_date,
    status: d.status,
    deductionAmountPence: d.deduction_amount_pence,
    deductionReason: d.deduction_reason,
    approvedAt: d.approved_at,
    processedAt: d.processed_at,
    createdAt: d.created_at
  }));

  const sorted = sortByUrgency(items);

  return {
    items: sorted,
    pendingReviewCount: items.filter((it) => it.status === "pending_review").length,
    dueSoonCount: items.filter((it) => isDueSoon(it, now)).length,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
