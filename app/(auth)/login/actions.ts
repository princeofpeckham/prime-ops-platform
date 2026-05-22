"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRole, defaultLandingFor } from "@/lib/auth/roles";

export async function signInWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password required")}`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const role = extractRole(user);

  if (!role) {
    // Account has no role assigned. Ops must set app_metadata.role.
    await supabase.auth.signOut();
    redirect(`/login?error=${encodeURIComponent("Account has no role assigned. Contact ops.")}`);
  }

  redirect(defaultLandingFor(role));
}

export async function signOut(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
