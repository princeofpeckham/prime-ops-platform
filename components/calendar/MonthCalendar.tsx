"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { addDaysIso, isoDow, isoIsWeekend } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import { addMonths, monthStart } from "./month";
import { DayDrawer } from "./DayDrawer";
import { KIND_ORDER, KIND_TOKEN, eventChip } from "./vocabulary";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DOW_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Build a 6x7 grid of ISO dates. The grid starts on the Monday on or before the
// 1st of the month, so weeks read Mon..Sun like the rest of the platform.
function buildGrid(monthStartIso: string): string[] {
  // isoDow: 0=Sun..6=Sat. Convert to Mon=0..Sun=6.
  const dow = isoDow(monthStartIso);
  const mondayIndex = (dow + 6) % 7;
  const gridStart = addDaysIso(monthStartIso, -mondayIndex);
  const cells: string[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDaysIso(gridStart, i));
  return cells;
}

function DayCell({
  iso,
  inMonth,
  isToday,
  events,
  onOpen
}: {
  iso: string;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  onOpen: () => void;
}) {
  const weekend = isoIsWeekend(iso);
  const dayNum = Number(iso.split("-")[2]);

  // Up to three chips, then a "+N" overflow. Chips follow the standard kind order.
  const ordered = [...events].sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
  );
  const shown = ordered.slice(0, 3);
  const overflow = ordered.length - shown.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx(
        "flex h-full min-h-[92px] flex-col gap-1 border-l border-t border-neutral-100 p-1.5 text-left transition-colors",
        inMonth ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100/60",
        weekend && inMonth && "bg-neutral-50/60",
        isToday && "ring-2 ring-inset ring-neutral-900"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "text-[11px] font-medium tabular-nums",
            inMonth ? "text-neutral-700" : "text-neutral-400",
            isToday && "text-neutral-900"
          )}
        >
          {dayNum}
        </span>
        {events.length > 0 && (
          <span className="rounded-full bg-neutral-100 px-1.5 text-[9px] font-medium tabular-nums text-neutral-500">
            {events.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {shown.map((ev) => (
          <span
            key={ev.id}
            className={clsx(
              "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[9px] font-medium",
              eventChip(ev)
            )}
            title={`${ev.title}${ev.propertyName ? ` , ${ev.propertyName}` : ""}`}
          >
            <span className="shrink-0 font-bold tracking-wider">{KIND_TOKEN[ev.kind]}</span>
            <span className="truncate">{ev.propertyName ?? ev.title}</span>
          </span>
        ))}
        {overflow > 0 && (
          <span className="px-1 text-[9px] font-medium text-neutral-500">+{overflow} more</span>
        )}
      </div>
    </button>
  );
}

export function MonthCalendar({
  events,
  todayIso,
  cursor,
  onCursorChange
}: {
  events: CalendarEvent[];
  todayIso: string;
  cursor: string;
  onCursorChange: (monthStartIso: string) => void;
}) {
  const [openDay, setOpenDay] = useState<string | null>(null);

  const grid = useMemo(() => buildGrid(cursor), [cursor]);
  const cursorMonth = cursor.slice(0, 7); // YYYY-MM

  // Index events by date once per render for fast per-cell lookup.
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const [y, m] = cursor.split("-").map(Number) as [number, number, number];
  const heading = `${MONTH_NAMES[m - 1]} ${y}`;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Month controls */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
        <h2 className="text-sm font-semibold text-neutral-900">{heading}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCursorChange(addMonths(cursor, -1))}
            className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            aria-label="Previous month"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(monthStart(todayIso))}
            className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(addMonths(cursor, 1))}
            className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            aria-label="Next month"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
        {DOW_HEADERS.map((d) => (
          <div
            key={d}
            className="border-l border-neutral-200 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-neutral-500 first:border-l-0"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 6-week grid */}
      <div className="grid grid-cols-7">
        {grid.map((iso) => (
          <DayCell
            key={iso}
            iso={iso}
            inMonth={iso.slice(0, 7) === cursorMonth}
            isToday={iso === todayIso}
            events={eventsByDate.get(iso) ?? []}
            onOpen={() => setOpenDay(iso)}
          />
        ))}
      </div>

      <DayDrawer
        dateIso={openDay}
        events={openDay ? eventsByDate.get(openDay) ?? [] : []}
        onClose={() => setOpenDay(null)}
      />
    </div>
  );
}
