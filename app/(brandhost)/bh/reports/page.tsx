import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getMyReportsData } from "@/lib/report-capture/data";
import {
  OVERALL_LABEL,
  OVERALL_TONE,
  TYPE_LABEL,
  type MyReportItem
} from "@/lib/report-capture/types";
import { isoShortLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

function reportDateIso(item: MyReportItem): string {
  const ts = item.submittedAt ?? item.createdAt;
  return ts.slice(0, 10);
}

export default async function BhReportsPage() {
  const data = await getMyReportsData();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">My reports</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Condition reports you have captured. {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <Link
          href="/bh/reports/new"
          className="shrink-0 rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New report
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{data.totalCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">With damage</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{data.damageCount}</p>
        </div>
      </section>

      {data.items.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          You have not captured any reports yet. Start one from a booking.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.items.map((item) => (
            <li key={item.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {item.brandName ?? "Booking"}
                    {item.propertyName ? ` · ${item.propertyName}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {item.bookingRef ? `${item.bookingRef} · ` : ""}
                    {isoShortLabel(reportDateIso(item))} · {item.areaCount} area
                    {item.areaCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone="neutral">{TYPE_LABEL[item.type]}</Badge>
                  {item.overallCondition ? (
                    <Badge tone={OVERALL_TONE[item.overallCondition]}>
                      {OVERALL_LABEL[item.overallCondition]}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {item.summary ? (
                <p className="mt-2 line-clamp-2 text-xs text-neutral-600">{item.summary}</p>
              ) : null}

              {item.hasDamageFlags ? (
                <p className="mt-2">
                  <Badge tone="alert">Flag raised</Badge>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
