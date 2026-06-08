// Server-side resolver for the caller's active organization.
// Memberships RLS lets a user read their own rows, so this is safe.

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getActiveOrgId(): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return data?.org_id ?? null;
}
