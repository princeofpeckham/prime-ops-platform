import { NextResponse } from "next/server";
import { syncBookingsFromSheet } from "@/lib/sheets/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron (sends Authorization: Bearer $CRON_SECRET) or manual trigger.
// Pulls the published All-Check-Ins CSV feed into bookings + shifts/cleans/deposits.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncBookingsFromSheet();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
