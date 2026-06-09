"use client";

import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { penceToGbp, isoShortLabel, isoShortDow } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { TYPE_LABEL, TYPE_TONE, shortTime } from "@/lib/bh-shifts/status";
import type { MarketplaceData, OpenShiftItem } from "@/lib/bh-shifts/types";
import { applyForShift, withdrawApplication } from "@/app/(brandhost)/bh/shifts/actions";

const ALL = "all";

function ShiftCard({ shift }: { shift: OpenShiftItem }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 rounded-lg border bg-white p-3 shadow-sm",
        shift.isEscalated ? "border-red-200 bg-red-50/60" : "border-neutral-200"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-900">
            {isoShortLabel(shift.date)}
            <span className="ml-1.5 text-[11px] font-normal text-neutral-400">
              {isoShortDow(shift.date)}
            </span>
          </span>
          <span className="text-[11px] tabular-nums text-neutral-500">
            {shortTime(shift.startTime)} to {shortTime(shift.endTime)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge tone={TYPE_TONE[shift.type]}>{TYPE_LABEL[shift.type]}</Badge>
          {shift.isEscalated ? <Badge tone="alert">Urgent</Badge> : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-neutral-800">{shift.propertyName ?? "Unknown space"}</span>
        <span className="font-medium tabular-nums text-neutral-900">{penceToGbp(shift.ratePence)}</span>
      </div>

      {shift.brand ? <div className="text-[11px] text-neutral-500">{shift.brand}</div> : null}

      <div className="mt-1">
        {shift.hasApplied ? (
          <div className="flex items-center justify-between gap-2">
            <Badge tone="accent">Applied</Badge>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(async () => { await withdrawApplication(shift.id); })}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Withdraw
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => { await applyForShift(shift.id); })}
            className="w-full rounded-md bg-prime-ink px-2.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Apply for shift
          </button>
        )}
      </div>
    </div>
  );
}

export function ShiftMarketplace({ data }: { data: MarketplaceData }) {
  const [type, setType] = useState<OpenShiftItem["type"] | typeof ALL>(ALL);

  const properties = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of data.shifts) {
      if (s.propertyName) seen.set(s.propertyId, s.propertyName);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [data.shifts]);

  const [propertyId, setPropertyId] = useState<string>(ALL);

  const filtered = useMemo(
    () =>
      data.shifts.filter((s) => {
        if (type !== ALL && s.type !== type) return false;
        if (propertyId !== ALL && s.propertyId !== propertyId) return false;
        return true;
      }),
    [data.shifts, type, propertyId]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as OpenShiftItem["type"] | typeof ALL)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
          >
            <option value={ALL}>All types</option>
            <option value="check_in">Check in</option>
            <option value="check_out">Check out</option>
            <option value="viewing">Viewing</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Space</span>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
          >
            <option value={ALL}>All spaces</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <span className="pb-1.5 text-xs text-neutral-500">
          Showing <span className="font-medium tabular-nums text-neutral-700">{filtered.length}</span> of{" "}
          {data.shifts.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-200 bg-white px-3 py-10 text-center text-sm text-neutral-400">
          No open shifts match these filters.
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((s) => (
            <ShiftCard key={s.id} shift={s} />
          ))}
        </div>
      )}
    </div>
  );
}
