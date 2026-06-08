"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";

// Mark a submitted condition report as reviewed, stamping the time now.
export async function markReviewed(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const { error } = await supabase
    .from("condition_reports")
    .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/reports");
}
