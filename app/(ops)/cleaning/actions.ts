"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Dispatch a cleaning job: notify the cleaner and mark the SMS as sent.
export async function dispatchClean(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("cleaning_jobs")
    .update({ status: "dispatched", sms_sent_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/cleaning");
}

// Mark a cleaning job complete once the cleaner has finished on site.
export async function markComplete(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("cleaning_jobs")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/cleaning");
}
