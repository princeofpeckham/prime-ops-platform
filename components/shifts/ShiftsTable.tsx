"use client";

import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { penceToGbp, isoShortLabel, isoShortDow } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TONE,
  TYPE_LABEL,
  TYPE_TONE,
  shortTime
} from "@/lib/shifts/status";
import type { ShiftItem, ShiftStatus, ShiftsData } from "@/lib/shifts/types";
import { assignShift, releaseShift } from "@/app/(ops)/shifts/actions";

const ALL = "all";

function ShiftRow({ shift }: { shift: ShiftItem }) {
  const [isPending, startTransition] = useTransition();

  const flagOpen = shift.status === "open";
  const flagEscalated = shift.isEscalated;

  return (
    <tr
      className={clsx(
        "border-t border-neutral-200 align-middle",
        flagEscalated ? "bg-red-50" : flagOpen ? "bg-orange-50/60" : "bg-white"
      )}
    >
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-neutral-800">
        <span className="font-medium">{isoShortLabel(shift.date)}</span>
        <span className="ml-1 text-[11px] text-neutral-400">{isoShortDow(shift.date)}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm tabular-nums text-neutral-700">
        {shortTime(shift.startTime)} to {shortTime(shift.endTime)}
      </td>
      <td className="px-3 py-2.5 text-sm text-neutral-800">{shift.propertyName ?? "Unknown space"}</td>
      <td className="px-3 py-2.5">
        <Badge tone={TYPE_TONE[shift.type]}>{TYPE_LABEL[shift.type]}</Badge>
      </td>
      <td className="px-3 py-2.5 text-sm text-neutral-700">{shift.brand ?? "No brand"}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm font-medium tabular-nums text-neutral-800">
        {penceToGbp(shift.ratePence)}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Badge tone={STATUS_TONE[shift.status]}>{STATUS_LABEL[shift.status]}</Badge>
          {flagEscalated ? <Badge tone="alert">Escalated</Badge> : null}
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm">
        {shift.isAssigned ? (
          <span className="text-neutral-700">Assigned</span>
        ) : (
          <span className="text-orange-700">Unassigned</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        {shift.isAssigned ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => { await releaseShift(shift.id); })}
            className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Release
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => { await assignShift(shift.id); })}
            className="rounded-md bg-prime-ink px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Assign
          </button>
        )}
      </td>
    </tr>
  );
}

export function ShiftsTable({ data }: { data: ShiftsData }) {
  const [status, setStatus] = useState<ShiftStatus | typeof ALL>(ALL);
  const [propertyId, setPropertyId] = useState<string>(ALL);

  const filtered = useMemo(
    () =>
      data.shifts.filter((s) => {
        if (status !== ALL && s.status !== status) return false;
        if (propertyId !== ALL && s.propertyId !== propertyId) return false;
        return true;
      }),
    [data.shifts, status, propertyId]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ShiftStatus | typeof ALL)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
          >
            <option value={ALL}>All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Property</span>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
          >
            <option value={ALL}>All properties</option>
            {data.properties.map((p) => (
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

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-left">
              {["Date", "Time", "Property", "Type", "Brand", "Rate", "Status", "Assignee", ""].map(
                (h, i) => (
                  <th
                    key={h || `col-${i}`}
                    className={clsx(
                      "px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500",
                      h === "Rate" ? "text-right" : ""
                    )}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-neutral-400">
                  No shifts match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => <ShiftRow key={s.id} shift={s} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ShiftsSummary({ data }: { data: ShiftsData }) {
  const assigned = data.shifts.filter((s) => s.isAssigned).length;
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
      <span>
        <span className="font-semibold text-neutral-900">{data.shifts.length}</span> shifts
      </span>
      <span>
        <span className="font-semibold tabular-nums text-neutral-900">{assigned}</span> assigned
      </span>
      {data.openCount > 0 ? (
        <span className="text-orange-700">{data.openCount} unassigned</span>
      ) : null}
      {data.escalatedCount > 0 ? (
        <span className="text-red-600">{data.escalatedCount} escalated</span>
      ) : null}
    </div>
  );
}
