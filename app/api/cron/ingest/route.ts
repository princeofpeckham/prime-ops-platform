import { NextResponse } from "next/server";
import { ingestGmail } from "@/lib/email/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Triggered by Vercel Cron (which sends Authorization: Bearer $CRON_SECRET),
// or manually with the same header. Pulls recent [PLUS] emails into enquiries.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await ingestGmail(25);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
