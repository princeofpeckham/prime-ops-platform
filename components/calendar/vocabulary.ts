// Shared colour + label vocabulary for the calendar, reusing the dashboard
// palette: check-in emerald, check-out amber, viewing blue, clean neutral,
// maintenance violet (red when urgent / in progress).

import type { CalendarEvent, CalendarEventKind, MaintenanceStatus } from "@/lib/calendar/types";

export const KIND_LABEL: Record<CalendarEventKind, string> = {
  check_in: "Check-in",
  check_out: "Check-out",
  viewing: "Viewing",
  clean: "Clean",
  maintenance: "Maintenance"
};

// Solid chip colours for the day cells.
export const KIND_CHIP: Record<CalendarEventKind, string> = {
  check_in: "bg-emerald-500 text-white",
  check_out: "bg-amber-500 text-white",
  viewing: "bg-blue-500 text-white",
  clean: "bg-neutral-400 text-white",
  maintenance: "bg-violet-500 text-white"
};

// Small dot colours (for the legend and count rows).
export const KIND_DOT: Record<CalendarEventKind, string> = {
  check_in: "bg-emerald-500",
  check_out: "bg-amber-500",
  viewing: "bg-blue-500",
  clean: "bg-neutral-400",
  maintenance: "bg-violet-500"
};

// Maintenance escalates to red while in progress (something is open at site).
export function maintenanceChip(status: MaintenanceStatus | null): string {
  if (status === "in_progress") return "bg-red-500 text-white";
  return KIND_CHIP.maintenance;
}

export function maintenanceDot(status: MaintenanceStatus | null): string {
  if (status === "in_progress") return "bg-red-500";
  return KIND_DOT.maintenance;
}

// The chip class for any event, honouring maintenance severity.
export function eventChip(ev: CalendarEvent): string {
  if (ev.kind === "maintenance") return maintenanceChip(ev.maintenanceStatus);
  return KIND_CHIP[ev.kind];
}

// Stable order so chips/counts always render the same way per cell.
export const KIND_ORDER: CalendarEventKind[] = [
  "check_in",
  "check_out",
  "viewing",
  "clean",
  "maintenance"
];

// A compact two-letter token used when a day has several events.
export const KIND_TOKEN: Record<CalendarEventKind, string> = {
  check_in: "CI",
  check_out: "CO",
  viewing: "VW",
  clean: "CL",
  maintenance: "MX"
};
