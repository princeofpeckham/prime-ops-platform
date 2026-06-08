"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/auth/org";
import type { Enums, TablesUpdate } from "@/lib/supabase/types";

type PropertyStatus = Enums<"property_status">;

const VALID_STATUSES: PropertyStatus[] = ["active", "fit_out", "archived"];

function toPence(pounds: string): number | null {
  const n = Number(pounds);
  if (!pounds || Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

// Edit the operational config for a single property: cleaning rate, status,
// and KeyNest collection instructions. Other columns are left untouched.
export async function updateProperty(formData: FormData): Promise<void> {
  const supabase = createSupabaseServerClient();
  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("No active organization");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Property id is required");

  const ratePence = toPence(String(formData.get("cleaning_rate_pounds") ?? ""));
  if (ratePence === null) throw new Error("Enter a valid cleaning rate");

  const status = String(formData.get("status") ?? "") as PropertyStatus;
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");

  const keynest = String(formData.get("keynest_instructions") ?? "").trim() || null;

  const patch: TablesUpdate<"properties"> = {
    cleaning_rate_pence: ratePence,
    status,
    keynest_instructions: keynest,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from("properties").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}
