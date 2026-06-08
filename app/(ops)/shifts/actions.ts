"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Assign an open shift. Marks status assigned and stamps the update time.
export async function assignShift(shiftId: string): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("shifts")
    .update({ status: "assigned", updated_at: new Date().toISOString() })
    .eq("id", shiftId);
  if (error) throw new Error(error.message);

  revalidatePath("/shifts");
}

// Release a shift back to the pool. Clears the assignee and reopens it.
export async function releaseShift(shiftId: string): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("shifts")
    .update({ status: "open", assigned_bh_id: null, updated_at: new Date().toISOString() })
    .eq("id", shiftId);
  if (error) throw new Error(error.message);

  revalidatePath("/shifts");
}
