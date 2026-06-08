import { Badge } from "@/components/ui/Badge";
import { isoShortLabel } from "@/lib/utils";
import {
  AREA_STATE_LABEL,
  AREA_STATE_TONE,
  OVERALL_LABEL,
  OVERALL_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_LABEL,
  isRegression
} from "@/lib/reports/labels";
import type { AreaDetail, CompareData, ReportSide } from "@/lib/reports/types";

function isoDateOnly(iso: string): string {
  return isoShortLabel(iso.slice(0, 10));
}

function SideHeader({ side, fallbackLabel }: { side: ReportSide | null; fallbackLabel: string }) {
  if (!side) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {fallbackLabel}
        </span>
        <span className="text-xs text-neutral-400">No report yet.</span>
      </div>
    );
  }
  const when = side.submittedAt ?? null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {TYPE_LABEL[side.type]}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={STATUS_TONE[side.status]}>{STATUS_LABEL[side.status]}</Badge>
        {side.overallCondition ? (
          <Badge tone={OVERALL_TONE[side.overallCondition]}>
            {OVERALL_LABEL[side.overallCondition]}
          </Badge>
        ) : null}
        {side.hasDamageFlags ? <Badge tone="alert">Damage flags</Badge> : null}
      </div>
      {when ? (
        <span className="text-[11px] text-neutral-400">Submitted {isoDateOnly(when)}</span>
      ) : null}
      {side.summary ? <p className="text-xs text-neutral-600">{side.summary}</p> : null}
    </div>
  );
}

function AreaCell({ detail, flag }: { detail: AreaDetail | null; flag: boolean }) {
  if (!detail) {
    return <span className="text-xs text-neutral-400">Not recorded</span>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Badge tone={AREA_STATE_TONE[detail.condition]}>{AREA_STATE_LABEL[detail.condition]}</Badge>
        {flag ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-red-600">
            Worsened
          </span>
        ) : null}
      </div>
      {detail.notes ? <p className="text-xs text-neutral-600">{detail.notes}</p> : null}
    </div>
  );
}

export function CompareView({ data }: { data: CompareData }) {
  const noReports = !data.checkIn && !data.checkOut;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <SideHeader side={data.checkIn} fallbackLabel="Check in" />
        </section>
        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <SideHeader side={data.checkOut} fallbackLabel="Check out" />
        </section>
      </div>

      {noReports ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          No condition reports found for this booking.
        </div>
      ) : data.rows.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          Reports exist but no areas were recorded.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-[minmax(120px,1fr)_2fr_2fr]">
            <div className="bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Area
            </div>
            <div className="hidden bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 sm:block">
              Check in
            </div>
            <div className="hidden bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 sm:block">
              Check out
            </div>

            {data.rows.map((row) => {
              const flag = isRegression(
                row.checkIn?.condition ?? null,
                row.checkOut?.condition ?? null
              );
              return (
                <div key={row.areaName} className="contents">
                  <div className="bg-white px-4 py-3 text-sm font-medium text-neutral-900">
                    {row.areaName}
                  </div>
                  <div className="bg-white px-4 py-3">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400 sm:hidden">
                      Check in
                    </span>
                    <AreaCell detail={row.checkIn} flag={false} />
                  </div>
                  <div className="bg-white px-4 py-3">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400 sm:hidden">
                      Check out
                    </span>
                    <AreaCell detail={row.checkOut} flag={flag} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
