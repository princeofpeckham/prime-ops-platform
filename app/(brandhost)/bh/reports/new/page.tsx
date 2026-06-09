import Link from "next/link";
import { getCaptureData } from "@/lib/report-capture/data";
import { getActiveOrgId } from "@/lib/auth/org";
import { CaptureForm } from "@/components/report-capture/CaptureForm";

export const dynamic = "force-dynamic";

export default async function BhNewReportPage() {
  const [data, orgId] = await Promise.all([getCaptureData(), getActiveOrgId()]);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-col gap-1">
        <Link href="/bh/reports" className="text-xs text-neutral-500 hover:text-neutral-800">
          ← My reports
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900">New condition report</h1>
        <p className="text-xs text-neutral-500">
          Walk the space room by room. Photograph anything damaged or missing.{" "}
          {data.source === "mock" ? "Demo data." : "Live."}
        </p>
      </header>

      {data.bookings.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          No bookings are ready for a report yet.
        </p>
      ) : (
        <CaptureForm bookings={data.bookings} orgId={orgId} />
      )}
    </main>
  );
}
