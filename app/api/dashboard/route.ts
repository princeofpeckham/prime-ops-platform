import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, note: "Implemented in Step 4" });
}
