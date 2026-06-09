"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// The cleaner taps "I'll take it" on a dispatched job. Records the moment
// they confirmed so ops can see the job is covered.
export async function confirmJob(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("cleaning_jobs")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("assigned_cleaner_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/cleaner/jobs");
}

// The cleaner finishes on site. The photos were already uploaded to the
// "condition-photos" bucket client-side; here we just record their storage
// paths and stamp the completion time.
export async function completeJob(id: string, photoPaths: string[]): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const paths = photoPaths.map((p) => p.trim()).filter((p) => p.length > 0);

  const { error } = await supabase
    .from("cleaning_jobs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completion_photos: paths
    })
    .eq("id", id)
    .eq("assigned_cleaner_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/cleaner/jobs");
  revalidatePath("/cleaner/history");
}
