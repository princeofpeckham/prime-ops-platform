"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
