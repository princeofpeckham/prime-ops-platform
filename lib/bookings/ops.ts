// When a booking is created, the ops engine needs its shifts and cleans.
// Pure builder (no DB) so it is unit-testable and reusable by promote-to-booking,
// the seed script, and future email ingestion.
//
// Spec rules (Technical Spec 3.3 / 3.5, CLAUDE.md):
//   Check-in shift  08:45 - 09:30  (BH arrives 08:45, 09:00 check-in)
//   Check-out shift 16:45 - 17:30  (17:00 checkout, the post-May-2026 standard)
//   Pre-clean   day of check-in,  morning window before arrival
//   Post-clean  day of check-out, after the 17:00 checkout
//   Shift rate  weekday 1700, weekend 2000 (pence/hr) from lib/rates.ts
//   Clean rate  property cleaning_rate_pence (default 15000)

import { isoIsWeekend } from "@/lib/utils";
import { BH_RATES } from "@/lib/rates";
import type { TablesInsert } from "@/lib/supabase/types";

export type BookingForOps = {
  id: string;
  org_id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  brand_name: string;
  cleaning_rate_pence?: number;
};

export function shiftRateFor(dateIso: string): number {
  return isoIsWeekend(dateIso) ? BH_RATES.weekendHourlyPence : BH_RATES.weekdayHourlyPence;
}

export function buildOpsForBooking(b: BookingForOps): {
  shifts: TablesInsert<"shifts">[];
  cleans: TablesInsert<"cleaning_jobs">[];
} {
  const cleanRate = b.cleaning_rate_pence ?? 15000;

  const shifts: TablesInsert<"shifts">[] = [
    {
      org_id: b.org_id,
      booking_id: b.id,
      property_id: b.property_id,
      type: "check_in",
      date: b.check_in_date,
      start_time: "08:45:00",
      end_time: "09:30:00",
      status: "open",
      rate_pence: shiftRateFor(b.check_in_date),
      notes: b.brand_name
    },
    {
      org_id: b.org_id,
      booking_id: b.id,
      property_id: b.property_id,
      type: "check_out",
      date: b.check_out_date,
      start_time: "16:45:00",
      end_time: "17:30:00",
      status: "open",
      rate_pence: shiftRateFor(b.check_out_date),
      notes: b.brand_name
    }
  ];

  const cleans: TablesInsert<"cleaning_jobs">[] = [
    {
      org_id: b.org_id,
      booking_id: b.id,
      property_id: b.property_id,
      type: "pre_clean",
      date: b.check_in_date,
      time_window: "08:00-09:00",
      status: "pending",
      rate_pence: cleanRate
    },
    {
      org_id: b.org_id,
      booking_id: b.id,
      property_id: b.property_id,
      type: "post_clean",
      date: b.check_out_date,
      time_window: "17:00 onwards",
      status: "pending",
      rate_pence: cleanRate
    }
  ];

  return { shifts, cleans };
}
