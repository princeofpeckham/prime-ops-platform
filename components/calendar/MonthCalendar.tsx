"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { addDaysIso, isoBetween, isoDow, isoIsWeekend } from "@/lib/utils";
import type { CalendarEvent, Tenancy } from "@/lib/calendar/types";
import { addMonths, monthStart } from "./month";
import { DayDrawer } from "./DayDrawer";
import type { PropertyColour } from "./colours";
import { propertyColour } from "./colours";
import { KIND_ORDER, KIND_TOKEN, eventChip } from "./vocabulary";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DOW_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Cell geometry shared by the in-flow spacer and the absolute bar overlay:
// p-1.5 top padding (6px) + day-number row (16px) + 2px gap = 24px, then one
// 16px lane plus a 2px gap per stacked tenancy.
const LANES_TOP_PX = 24;
const LANE_HEIGHT_PX = 16;
const LANE_STEP_PX = 18;
const MAX_LANES = 3;

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

// Greedy lane assignment over the whole visible grid so a tenancy keeps the
// same lane from week to week. Lanes beyond MAX_LANES become "+N" overflow.
function assignLanes(tenancies: Tenancy[]): Map<string, number> {
  const sorted = [...tenancies].sort((a, b) =>
    a.startDate === b.startDate
      ? a.endDate.localeCompare(b.endDate)
      : a.startDate.localeCompare(b.startDate)
  );
  const laneEnds: string[] = [];
  const lanes = new Map<string, number>();
  for (const t of sorted) {
    let lane = laneEnds.findIndex((end) => end < t.startDate);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(t.endDate);
    } else {
      laneEnds[lane] = t.endDate;
    }
    lanes.set(t.bookingId, lane);
  }
  return lanes;
}

function DayCell({
  iso,
  inMonth,
  isToday,
  chips,
  itemCount,
  laneAreaPx,
  laneOverflow,
  onOpen
}: {
  iso: string;
  inMonth: boolean;
  isToday: boolean;
  chips: CalendarEvent[];
  itemCount: number;
  laneAreaPx: number;
  laneOverflow: number;
  onOpen: () => void;
}) {
  const weekend = isoIsWeekend(iso);
  const dayNum = Number(iso.split("-")[2]);

  // Up to three small chips, then a "+N" overflow, in the standard kind order.
  const ordered = [...chips].sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
  );
  const shown = ordered.slice(0, 3);
  const chipOverflow = ordered.length - shown.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx(
        "flex h-full min-h-[104px] flex-col border-l border-t border-neutral-100 p-1.5 text-left transition-colors",
        inMonth ? "bg-white hover:bg-neutral-50" : "bg-neutral-50/60 hover:bg-neutral-100/60",
        weekend && inMonth && "bg-neutral-50/60",
        isToday && "ring-2 ring-inset ring-neutral-900"
      )}
    >
      <div className="mb-0.5 flex h-4 items-center justify-between">
        <span
          className={clsx(
            "text-[11px] font-medium leading-none tabular-nums",
            inMonth ? "text-neutral-700" : "text-neutral-400",
            isToday && "text-neutral-900"
          )}
        >
          {dayNum}
        </span>
        {itemCount > 0 && (
          <span className="rounded-full bg-neutral-100 px-1.5 text-[9px] font-medium tabular-nums text-neutral-500">
            {itemCount}
          </span>
        )}
      </div>

      {/* Reserved space for the tenancy lanes drawn by the week overlay. */}
      {laneAreaPx > 0 && <div style={{ height: laneAreaPx }} aria-hidden="true" />}
      {laneOverflow > 0 && (
        <span className="text-[9px] font-medium text-neutral-500">+{laneOverflow}</span>
      )}

      <div className="mt-0.5 flex flex-col gap-0.5">
        {shown.map((ev) => (
          <span
            key={ev.id}
            className={clsx(
              "flex items-center gap-1 truncate rounded px-1 py-px text-[8px] font-medium",
              eventChip(ev)
            )}
            title={`${ev.title}${ev.propertyName ? `, ${ev.propertyName}` : ""}`}
          >
            <span className="shrink-0 font-bold tracking-wider">{KIND_TOKEN[ev.kind]}</span>
            <span className="truncate">{ev.propertyName ?? ev.title}</span>
          </span>
        ))}
        {chipOverflow > 0 && (
          <span className="px-1 text-[8px] font-medium text-neutral-500">+{chipOverflow} more</span>
        )}
      </div>
    </button>
  );
}

// One continuous bar for a tenancy within a single week row. Rounded only at
// the tenancy's true start/end; flat where it continues into adjacent weeks.
// The darker edge marks check-in (left) and check-out (right).
function TenancyBar({
  tenancy,
  week,
  lane,
  colour
}: {
  tenancy: Tenancy;
  week: string[];
  lane: number;
  colour: PropertyColour;
}) {
  const weekStartIso = week[0] ?? "";
  const weekEndIso = week[6] ?? "";
  const startsThisWeek = tenancy.startDate >= weekStartIso;
  const endsThisWeek = tenancy.endDate <= weekEndIso;
  const startIdx = startsThisWeek ? week.indexOf(tenancy.startDate) : 0;
  const endIdx = endsThisWeek ? week.indexOf(tenancy.endDate) : 6;
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null;

  return (
    <div
      className={clsx(
        "pointer-events-none absolute flex items-center overflow-hidden",
        colour.bar,
        startsThisWeek && "rounded-l-md",
        endsThisWeek && "rounded-r-md"
      )}
      style={{
        left: `${(startIdx / 7) * 100}%`,
        width: `${((endIdx - startIdx + 1) / 7) * 100}%`,
        top: LANES_TOP_PX + lane * LANE_STEP_PX,
        height: LANE_HEIGHT_PX
      }}
      title={`${tenancy.brandName}, ${tenancy.propertyName ?? "No property"}`}
    >
      {startsThisWeek && (
        <span className={clsx("absolute inset-y-0 left-0 w-[3px]", colour.dark)} />
      )}
      {endsThisWeek && (
        <span className={clsx("absolute inset-y-0 right-0 w-[3px]", colour.dark)} />
      )}
      <span className="min-w-0 truncate px-1.5 text-[10px] font-medium leading-none text-white">
        {tenancy.brandName}
      </span>
    </div>
  );
}

function WeekRow({
  week,
  cursorMonth,
  todayIso,
  tenancies,
  lanes,
  colours,
  eventsByDate,
  onOpenDay
}: {
  week: string[];
  cursorMonth: string;
  todayIso: string;
  tenancies: Tenancy[];
  lanes: Map<string, number>;
  colours: Map<string, PropertyColour>;
  eventsByDate: Map<string, CalendarEvent[]>;
  onOpenDay: (iso: string) => void;
}) {
  const weekStartIso = week[0] ?? "";
  const weekEndIso = week[6] ?? "";

  const inWeek = tenancies.filter(
    (t) => t.startDate <= weekEndIso && t.endDate >= weekStartIso
  );
  const shownBars = inWeek.filter((t) => (lanes.get(t.bookingId) ?? 0) < MAX_LANES);
  const hiddenBars = inWeek.filter((t) => (lanes.get(t.bookingId) ?? 0) >= MAX_LANES);

  const laneCount =
    shownBars.length === 0
      ? 0
      : Math.max(...shownBars.map((t) => lanes.get(t.bookingId) ?? 0)) + 1;
  const laneAreaPx = laneCount > 0 ? laneCount * LANE_STEP_PX : 0;

  return (
    <div className="relative grid grid-cols-7">
      {week.map((iso) => {
        const dayEvents = eventsByDate.get(iso) ?? [];
        // CI/CO are carried by the tenancy span edges; chips cover the rest.
        const chips = dayEvents.filter((e) => e.kind !== "check_in" && e.kind !== "check_out");
        const dayTenancies = inWeek.filter((t) => isoBetween(iso, t.startDate, t.endDate));
        const laneOverflow = hiddenBars.filter((t) =>
          isoBetween(iso, t.startDate, t.endDate)
        ).length;
        return (
          <DayCell
            key={iso}
            iso={iso}
            inMonth={iso.slice(0, 7) === cursorMonth}
            isToday={iso === todayIso}
            chips={chips}
            itemCount={chips.length + dayTenancies.length}
            laneAreaPx={laneAreaPx}
            laneOverflow={laneOverflow}
            onOpen={() => onOpenDay(iso)}
          />
        );
      })}

      {shownBars.map((t) => (
        <TenancyBar
          key={t.bookingId}
          tenancy={t}
          week={week}
          lane={lanes.get(t.bookingId) ?? 0}
          colour={propertyColour(colours, t.propertyId)}
        />
      ))}
    </div>
  );
}

export function MonthCalendar({
  events,
  tenancies,
  colours,
  todayIso,
  cursor,
  onCursorChange
}: {
  events: CalendarEvent[];
  tenancies: Tenancy[];
  colours: Map<string, PropertyColour>;
  todayIso: string;
  cursor: string;
  onCursorChange: (monthStartIso: string) => void;
}) {
  const [openDay, setOpenDay] = useState<string | null>(null);

  const grid = useMemo(() => buildGrid(cursor), [cursor]);
  const weeks = useMemo(() => {
    const out: string[][] = [];
    for (let i = 0; i < grid.length; i += 7) out.push(grid.slice(i, i + 7));
    return out;
  }, [grid]);
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

  // Only tenancies intersecting the visible grid take part in lane assignment.
  const gridStart = grid[0] ?? cursor;
  const gridEnd = grid[grid.length - 1] ?? cursor;
  const visibleTenancies = useMemo(
    () => tenancies.filter((t) => t.startDate <= gridEnd && t.endDate >= gridStart),
    [tenancies, gridStart, gridEnd]
  );
  const lanes = useMemo(() => assignLanes(visibleTenancies), [visibleTenancies]);

  const openDayTenancies = openDay
    ? visibleTenancies.filter((t) => isoBetween(openDay, t.startDate, t.endDate))
    : [];

  const [y, m] = cursor.split("-").map(Number) as [number, number, number];
  const heading = `${MONTH_NAMES[m - 1]} ${y}`;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
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

      {/* 6 week rows, each with its own tenancy-bar overlay */}
      <div className="flex flex-col">
        {weeks.map((week) => (
          <WeekRow
            key={week[0]}
            week={week}
            cursorMonth={cursorMonth}
            todayIso={todayIso}
            tenancies={visibleTenancies}
            lanes={lanes}
            colours={colours}
            eventsByDate={eventsByDate}
            onOpenDay={setOpenDay}
          />
        ))}
      </div>

      <DayDrawer
        dateIso={openDay}
        events={openDay ? eventsByDate.get(openDay) ?? [] : []}
        tenancies={openDayTenancies}
        colours={colours}
        onClose={() => setOpenDay(null)}
      />
    </div>
  );
}
