"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import type { CalendarData } from "@/lib/calendar/types";
import { MonthCalendar } from "./MonthCalendar";
import { CalendarLegend } from "./CalendarLegend";
import { PropertiesPanel } from "./PropertiesPanel";
import { buildPropertyColours } from "./colours";
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

export function CalendarView({
  data,
  todayIso,
  children
}: {
  data: CalendarData;
  todayIso: string;
  children?: ReactNode;
}) {
  const [cursor, setCursor] = useState<string>(() => monthStart(todayIso));
  // Property visibility: everything on by default; hidden ids are toggled off.
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());

  const colours = useMemo(() => buildPropertyColours(data.properties), [data.properties]);

  const toggleProperty = (id: string) =>
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const showPrimeOnly = () =>
    setHiddenIds(new Set(data.properties.filter((p) => p.tier !== "prime").map((p) => p.id)));

  const showAll = () => setHiddenIds(new Set());

  // Hiding a property hides its tenancy bars and its event chips alike.
  const visibleEvents = useMemo(
    () => data.events.filter((e) => e.propertyId === null || !hiddenIds.has(e.propertyId)),
    [data.events, hiddenIds]
  );
  const visibleTenancies = useMemo(
    () => data.tenancies.filter((t) => !hiddenIds.has(t.propertyId)),
    [data.tenancies, hiddenIds]
  );

  // Summary counts are scoped to the visible month and the visible properties.
  const summary = useMemo(() => {
    const key = monthKey(cursor);
    const inMonth = visibleEvents.filter((e) => monthKey(e.date) === key);
    return {
      viewings: inMonth.filter((e) => e.kind === "viewing").length,
      checkIns: inMonth.filter((e) => e.kind === "check_in").length,
      checkOuts: inMonth.filter((e) => e.kind === "check_out").length,
      cleans: inMonth.filter((e) => e.kind === "clean").length
    };
  }, [visibleEvents, cursor]);

  // Open maintenance (unscheduled + scheduled + in_progress), honouring visibility.
  const openMaintenance = useMemo(
    () =>
      data.maintenance.filter(
        (m) =>
          !hiddenIds.has(m.propertyId) &&
          (m.status === "unscheduled" || m.status === "scheduled" || m.status === "in_progress")
      ).length,
    [data.maintenance, hiddenIds]
  );

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      {/* Left block: togglable property legend + event-kind key */}
      <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:w-64 lg:shrink-0">
        <PropertiesPanel
          properties={data.properties}
          colours={colours}
          hiddenIds={hiddenIds}
          onToggle={toggleProperty}
          onPrimeOnly={showPrimeOnly}
          onShowAll={showAll}
        />
        <CalendarLegend />
      </aside>

      {/* Right block: summary strip + month grid */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Stat label="viewings" value={summary.viewings} dotClass={KIND_DOT.viewing} />
          <Stat label="check-ins" value={summary.checkIns} dotClass={KIND_DOT.check_in} />
          <Stat label="check-outs" value={summary.checkOuts} dotClass={KIND_DOT.check_out} />
          <Stat label="cleans" value={summary.cleans} dotClass={KIND_DOT.clean} />
          <Stat label="open maintenance" value={openMaintenance} dotClass={KIND_DOT.maintenance} />
        </div>

        <MonthCalendar
          events={visibleEvents}
          tenancies={visibleTenancies}
          colours={colours}
          todayIso={todayIso}
          cursor={cursor}
          onCursorChange={setCursor}
        />

        {children}
      </div>
    </div>
  );
}
