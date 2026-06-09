"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";

// Brand host applies for an open shift. Inserts a pending application against
// the signed in user. RLS plus the unique key on (shift_id, bh_id) keep this
// from creating duplicates; we guard for an existing pending row too so a
// double tap reads as a no op rather than an error.
export async function applyForShift(shiftId: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("shift_applications")
    .select("id,status")
    .eq("shift_id", shiftId)
    .eq("bh_id", user.id)
    .maybeSingle();

  if (existing) {
    // Re applying after a withdrawal: flip it back to pending.
    if (existing.status !== "pending") {
      const { error } = await supabase
        .from("shift_applications")
        .update({ status: "pending", applied_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("shift_applications").insert({
      org_id: orgId,
      shift_id: shiftId,
      bh_id: user.id,
      status: "pending"
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/bh/shifts");
  revalidatePath("/bh/my-shifts");
}

// Brand host withdraws their pending application for a shift.
export async function withdrawApplication(shiftId: string): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("shift_applications")
    .update({ status: "withdrawn", decided_at: new Date().toISOString() })
    .eq("shift_id", shiftId)
    .eq("bh_id", user.id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);

  revalidatePath("/bh/shifts");
  revalidatePath("/bh/my-shifts");
}
