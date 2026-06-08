// Live settings data from Supabase. RLS scopes everything to the caller's org.
// Note: auth.users emails are not reachable via PostgREST, so the team list
// exposes role and join date only, never an email address.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import { countRoles } from "./labels";
import { generateMockSettings } from "./mock";
import { NOTIFICATION_TEMPLATES } from "./templates";
import type { PropertyConfig, SettingsData, TeamMember } from "./types";

export async function fetchSettingsFromSupabase(now: Date = new Date()): Promise<SettingsData> {
  const supabase = createSupabaseServerClient();

  const [membershipsRes, propertiesRes] = await Promise.all([
    supabase.from("memberships").select("*").order("created_at", { ascending: true }),
    supabase.from("properties").select("*").order("name")
  ]);

  const memberships: Tables<"memberships">[] = membershipsRes.data ?? [];
  const propertyRows: Tables<"properties">[] = propertiesRes.data ?? [];

  let team: TeamMember[] = memberships.map((m) => ({
    id: m.id,
    role: m.role,
    createdAt: m.created_at
  }));

  // Fall back to demo team data if the org has no memberships visible yet,
  // so the section is never blank in a fresh environment.
  if (team.length === 0) {
    team = generateMockSettings(now).team;
  }

  const properties: PropertyConfig[] = propertyRows.map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    postcode: p.postcode,
    tier: p.tier,
    status: p.status,
    cleaningRatePence: p.cleaning_rate_pence,
    keynestInstructions: p.keynest_instructions
  }));

  return {
    team,
    roleCounts: countRoles(team),
    properties,
    templates: NOTIFICATION_TEMPLATES,
    source: "supabase",
    generatedAt: now.toISOString()
  };
}
