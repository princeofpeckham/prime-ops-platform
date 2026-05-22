import clsx from "clsx";
import { isoIsWeekend, isoShortDow, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { TimelineCell, TimelineRow } from "@/lib/dashboard/types";

function cellStyles(cell: TimelineCell, isWeekend: boolean): string {
  const base = "h-12 border-l border-neutral-200 px-1.5 py-1 relative";
  const tone =
    cell.state === "checkin"
      ? "bg-emerald-50"
      : cell.state === "checkout"
        ? "bg-amber-50"
        : cell.state === "transition"
          ? "bg-purple-50"
          : cell.state === "occupied"
            ? "bg-neutral-100"
            : isWeekend
              ? "bg-neutral-50/60"
              : "bg-white";
  return clsx(base, tone);
}

function TierBadge({ tier, status }: { tier: string; status: string }) {
  if (status === "fit_out") return <Badge tone="warn">Fit-out</Badge>;
  if (tier === "prime") return <Badge tone="accent">PRIME</Badge>;
  if (tier === "pro") return <Badge tone="good">PRO</Badge>;
  return <Badge tone="muted">Other</Badge>;
}

function CellContent({ cell }: { cell: TimelineCell }) {
  if (cell.state === "empty") return null;
  return (
    <div className="flex h-full flex-col justify-between">
      <span className="truncate text-[11px] font-medium text-neutral-800">
        {cell.brandName ?? " "}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
        {cell.state === "checkin"
          ? "CI"
          : cell.state === "checkout"
            ? "CO"
            : cell.state === "transition"
              ? "CI / CO"
              : ""}
      </span>
    </div>
  );
}

function CellOverlays({ cell }: { cell: TimelineCell }) {
  return (
    <>
      {cell.hasUnassignedShift ? (
        <span
          className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-red-500"
          title="Unassigned shift"
        />
      ) : null}
      {cell.hasUnconfirmedClean ? (
        <span
          className="absolute left-1 top-1 inline-block h-2 w-2 rounded-full bg-amber-500"
          title="Unconfirmed clean"
        />
      ) : null}
    </>
  );
}

export function TimelineGrid({
  rows,
  days,
  windowStart
}: {
  rows: TimelineRow[];
  days: string[];
  windowStart: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="sticky left-0 z-10 w-48 border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
              Property
            </th>
            {days.map((iso) => {
              const weekend = isoIsWeekend(iso);
              const isToday = iso === windowStart;
              return (
                <th
                  key={iso}
                  className={clsx(
                    "w-24 border-b border-l border-neutral-200 px-2 py-1 text-center text-[10px] font-medium",
                    weekend ? "bg-neutral-100" : "bg-neutral-50",
                    isToday && "ring-2 ring-inset ring-prime-accent"
                  )}
                >
                  <div className="uppercase tracking-wide text-neutral-500">
                    {isoShortDow(iso)}
                  </div>
                  <div className="text-neutral-800">{isoShortLabel(iso)}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ property, cells }) => (
            <tr key={property.id} className="border-t border-neutral-200">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-3 py-2 text-left align-top"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral-900">
                    {property.name}
                  </span>
                  <TierBadge tier={property.tier} status={property.status} />
                </div>
              </th>
              {cells.map((cell) => (
                <td
                  key={cell.date}
                  className={cellStyles(cell, isoIsWeekend(cell.date))}
                >
                  <CellContent cell={cell} />
                  <CellOverlays cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
