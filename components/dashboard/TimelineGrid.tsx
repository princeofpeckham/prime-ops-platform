"use client";

import { useState } from "react";
import clsx from "clsx";
import { isoIsWeekend, isoShortDow, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EventDrawer } from "./EventDrawer";
import type { EventDetail, TimelineCell, TimelineRow } from "@/lib/dashboard/types";

// -------------------------------------------------------
// Pill: the small clickable CI / CO / flag chip in a cell
// -------------------------------------------------------
function EventPill({
  cell,
  onClick
}: {
  cell: TimelineCell;
  onClick: () => void;
}) {
  if (cell.state === "empty") return null;

  // Only CI/CO/transition cells get a clickable pill
  const isEvent = cell.state === "checkin" || cell.state === "checkout" || cell.state === "transition";

  const pillLabel =
    cell.state === "checkin" ? "CI"
    : cell.state === "checkout" ? "CO"
    : cell.state === "transition" ? "CI/CO"
    : null;

  const pillColor =
    cell.state === "checkin" ? "bg-emerald-500 text-white"
    : cell.state === "checkout" ? "bg-amber-500 text-white"
    : cell.state === "transition" ? "bg-purple-500 text-white"
    : "";

  // Coverage indicators
  const hasAlert = cell.hasUnassignedShift || cell.hasUnconfirmedClean;

  if (!isEvent) {
    // Occupied day: just a subtle bar
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-1 w-6 rounded-full bg-neutral-300" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded transition-all",
        "hover:ring-2 hover:ring-neutral-400 hover:ring-offset-1",
        "focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
      )}
    >
      {/* Brand name (truncated) */}
      <span className="max-w-full truncate px-0.5 text-[10px] font-medium text-neutral-700 group-hover:text-neutral-900">
        {cell.brandName ?? ""}
      </span>

      {/* CI/CO pill */}
      <span className={clsx("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", pillColor)}>
        {pillLabel}
      </span>

      {/* Alert dots */}
      {hasAlert && (
        <div className="absolute right-0.5 top-0.5 flex gap-0.5">
          {cell.hasUnassignedShift && (
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="BH unassigned" />
          )}
          {cell.hasUnconfirmedClean && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Clean unconfirmed" />
          )}
        </div>
      )}

      {/* Damage flag indicator */}
      {cell.hasDamageFlag && (
        <span className="absolute bottom-0.5 left-0.5 flex items-center gap-0.5 rounded bg-red-100 px-1 py-0.5 text-[8px] font-bold text-red-600">
          <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a1 1 0 0 1 .894.553l6 12A1 1 0 0 1 14 15H2a1 1 0 0 1-.894-1.447l6-12A1 1 0 0 1 8 1z"/></svg>
          {cell.damageCount}
        </span>
      )}
    </button>
  );
}

// -------------------------------------------------------
// Standalone damage flag pill (for days with flags but no CI/CO)
// -------------------------------------------------------
function DamagePill({ cell }: { cell: TimelineCell }) {
  if (!cell.hasDamageFlag || cell.state !== "empty") return null;
  return (
    <div className="flex h-full items-center justify-center">
      <span className="flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a1 1 0 0 1 .894.553l6 12A1 1 0 0 1 14 15H2a1 1 0 0 1-.894-1.447l6-12A1 1 0 0 1 8 1z"/></svg>
        {cell.damageCount} flag{cell.damageCount > 1 ? "s" : ""}
      </span>
    </div>
  );
}

// -------------------------------------------------------
// Tier badge in the property column
// -------------------------------------------------------
function TierBadge({ tier, status }: { tier: string; status: string }) {
  if (status === "fit_out") return <Badge tone="warn">Fit-out</Badge>;
  if (tier === "prime") return <Badge tone="accent">PRIME</Badge>;
  if (tier === "pro") return <Badge tone="good">PRO</Badge>;
  return <Badge tone="muted">Other</Badge>;
}

// -------------------------------------------------------
// Main grid
// -------------------------------------------------------
export function TimelineGrid({
  rows,
  days,
  windowStart,
  primeOnly = false
}: {
  rows: TimelineRow[];
  days: string[];
  windowStart: string;
  primeOnly?: boolean;
}) {
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);

  const displayRows = primeOnly
    ? rows.filter((r) => r.property.tier === "prime")
    : rows;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="sticky left-0 z-10 w-40 border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                Property
              </th>
              {days.map((iso) => {
                const weekend = isoIsWeekend(iso);
                const isToday = iso === windowStart;
                return (
                  <th
                    key={iso}
                    className={clsx(
                      "w-[72px] min-w-[72px] border-b border-l border-neutral-200 px-1 py-1 text-center text-[10px] font-medium",
                      weekend ? "bg-neutral-100" : "bg-neutral-50",
                      isToday && "ring-2 ring-inset ring-neutral-900"
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
            {displayRows.map(({ property, cells }) => (
              <tr key={property.id} className="border-t border-neutral-100">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-3 py-1.5 text-left align-middle"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-900">
                      {property.name}
                    </span>
                    <TierBadge tier={property.tier} status={property.status} />
                  </div>
                </th>
                {cells.map((cell) => {
                  const weekend = isoIsWeekend(cell.date);
                  const isEvent = cell.state === "checkin" || cell.state === "checkout" || cell.state === "transition";
                  return (
                    <td
                      key={cell.date}
                      className={clsx(
                        "h-14 border-l border-neutral-100 p-0.5",
                        weekend && cell.state === "empty" ? "bg-neutral-50/60" : "bg-white",
                        cell.state === "occupied" && "bg-neutral-50"
                      )}
                    >
                      {isEvent ? (
                        <EventPill
                          cell={cell}
                          onClick={() => {
                            if (cell.eventDetail) setSelectedEvent(cell.eventDetail);
                          }}
                        />
                      ) : cell.hasDamageFlag ? (
                        <DamagePill cell={cell} />
                      ) : cell.state === "occupied" ? (
                        <div className="flex h-full items-center justify-center">
                          <div className="h-1 w-6 rounded-full bg-neutral-300" />
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <EventDrawer detail={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}
