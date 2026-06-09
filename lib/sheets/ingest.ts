// Production booking sync: fetch the published All-Check-Ins CSV feed (the
// stripped space_name,address,postcode,brand,checkin,checkout columns, no PII),
// parse, and upsert bookings with their shifts, cleans, and deposit. Idempotent
// by external_id. Set SHEET_FEED_CSV_URL to the published CSV (publish-to-web).

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { londonToday, addDaysIso } from "@/lib/utils";
import { buildOpsForBooking, buildDepositForBooking } from "@/lib/bookings/ops";
import { parseFeedRows, type FeedRow, type PropertyRef } from "./parse";

const DEFAULT_ORG = "a0000000-0000-4000-8000-000000000001";

export type SyncResult = { fetched: number; matched: number; created: number; existing: number; skipped: number };

// Minimal RFC4180-ish CSV parser (handles quoted fields with commas + escaped quotes).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += ch; }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else { field += ch; }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toFeedRows(csv: string): FeedRow[] {
  const grid = parseCsv(csv);
  if (grid.length < 2) return [];
  const header = (grid[0] ?? []).map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const idx = {
    space: col("space_name"), addr: col("address"), post: col("postcode"),
    brand: col("brand"), ci: col("checkin"), co: col("checkout")
  };
  const out: FeedRow[] = [];
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r] ?? [];
    out.push({
      space_name: (cells[idx.space] ?? "").trim(),
      address: (cells[idx.addr] ?? "").trim(),
      postcode: (cells[idx.post] ?? "").trim(),
      brand: (cells[idx.brand] ?? "").trim(),
      checkin: (cells[idx.ci] ?? "").trim(),
      checkout: (cells[idx.co] ?? "").trim()
    });
  }
  return out;
}

export async function syncBookingsFromSheet(): Promise<SyncResult> {
  const url = process.env.SHEET_FEED_CSV_URL;
  if (!url) throw new Error("SHEET_FEED_CSV_URL is not configured");
  const orgId = process.env.PRIME_DEFAULT_ORG_ID ?? DEFAULT_ORG;

  const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`);
  if (!res.ok) throw new Error(`feed fetch failed: ${res.status}`);
  const csv = await res.text();

  const today = londonToday();
  const windowStart = addDaysIso(today, -21);
  const windowEnd = addDaysIso(today, 60);
  const allRows = toFeedRows(csv).filter((r) => r.checkout >= windowStart && r.checkin <= windowEnd);

  const supa = createSupabaseServiceRoleClient();
  const { data: props } = await supa.from("properties").select("id,name,address").eq("org_id", orgId);
  const refs: PropertyRef[] = (props ?? []).map((p) => ({ id: p.id, name: p.name, address: p.address }));

  const { bookings, skipped } = parseFeedRows(allRows, refs);
  const result: SyncResult = { fetched: allRows.length, matched: bookings.length, created: 0, existing: 0, skipped: skipped.length };

  for (const b of bookings) {
    const { data: exists } = await supa.from("bookings").select("id").eq("org_id", orgId).eq("external_id", b.externalId).maybeSingle();
    if (exists) { result.existing++; continue; }

    const status = b.checkOutDate < today ? "completed" : b.checkInDate <= today ? "active" : "confirmed";
    const { data: booking } = await supa.from("bookings").insert({
      org_id: orgId, external_id: b.externalId, property_id: b.propertyId, brand_name: b.brandName,
      check_in_date: b.checkInDate, check_out_date: b.checkOutDate, ttv_pence: 0, status
    }).select("id").single();
    if (!booking) continue;

    const ops = buildOpsForBooking({ id: booking.id, org_id: orgId, property_id: b.propertyId, check_in_date: b.checkInDate, check_out_date: b.checkOutDate, brand_name: b.brandName });
    await supa.from("shifts").insert(ops.shifts);
    await supa.from("cleaning_jobs").insert(ops.cleans);
    await supa.from("deposits").insert(buildDepositForBooking({ id: booking.id, org_id: orgId, property_id: b.propertyId, check_out_date: b.checkOutDate }));
    result.created++;
  }

  return result;
}
