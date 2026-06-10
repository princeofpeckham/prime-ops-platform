"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { CalendarData } from "@/lib/calendar/types";
import { MonthCalendar } from "./MonthCalendar";
import { CalendarLegend } from "./CalendarLegend";
import { monthKey, monthStart } from "./month";
import { KIND_DOT } from "./vocabulary";

// A single stat in the month summary strip.
function Stat({ label, value, dotClass }: { label: string; value: number; dotClass?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dotClass && <span className={clsx("inline-block h-2 w-2 rounded-full", dotClass)} />}
      <span className="font-semibold tabular-nums text-neutral-900">{value}</span>
      <span className="text-neutral-500">{label}</span>
    </span>
  );
}

export function CalendarView({ data, todayIso }: { data: CalendarData; todayIso: string }) {
  const [cursor, setCursor] = useState<string>(() => monthStart(todayIso));
  const [propertyId, setPropertyId] = useState<string>("all");

  // Property filter narrows the whole calendar.
  const filteredEvents = useMemo(
    () =>
      propertyId === "all"
        ? data.events
        : data.events.filter((e) => e.propertyId === propertyId),
    [data.events, propertyId]
  );

  // Summary counts are scoped to the visible month and the active filter.
  const summary = useMemo(() => {
    const key = monthKey(cursor);
    const inMonth = filteredEvents.filter((e) => monthKey(e.date) === key);
    return {
      viewings: inMonth.filter((e) => e.kind === "viewing").length,
      checkIns: inMonth.filter((e) => e.kind === "check_in").length,
      checkOuts: inMonth.filter((e) => e.kind === "check_out").length,
      cleans: inMonth.filter((e) => e.kind === "clean").length
    };
  }, [filteredEvents, cursor]);

  // Open maintenance (unscheduled + scheduled + in_progress), honouring the filter.
  const openMaintenance = useMemo(
    () =>
      data.maintenance.filter(
        (m) =>
          (propertyId === "all" || m.propertyId === propertyId) &&
          (m.status === "unscheduled" || m.status === "scheduled" || m.status === "in_progress")
      ).length,
    [data.maintenance, propertyId]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Filter + summary strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Stat label="viewings" value={summary.viewings} dotClass={KIND_DOT.viewing} />
          <Stat label="check-ins" value={summary.checkIns} dotClass={KIND_DOT.check_in} />
          <Stat label="check-outs" value={summary.checkOuts} dotClass={KIND_DOT.check_out} />
          <Stat label="cleans" value={summary.cleans} dotClass={KIND_DOT.clean} />
          <Stat label="open maintenance" value={openMaintenance} dotClass={KIND_DOT.maintenance} />
        </div>
        <label className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="font-medium uppercase tracking-wide">Property</span>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none"
          >
            <option value="all">All properties</option>
            {data.properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MonthCalendar
        events={filteredEvents}
        todayIso={todayIso}
        cursor={cursor}
        onCursorChange={setCursor}
      />

      <CalendarLegend />
    </div>
  );
}
