"use client";

import { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { isoShortDow, isoShortLabel } from "@/lib/utils";
import type { CalendarEvent, Tenancy } from "@/lib/calendar/types";
import type { PropertyColour } from "./colours";
import { propertyColour } from "./colours";
import { KIND_LABEL, KIND_ORDER, eventChip } from "./vocabulary";

function TenancyRow({ tenancy, colour }: { tenancy: Tenancy; colour: PropertyColour }) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2">
      <span className={clsx("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", colour.dot)} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-xs font-semibold text-neutral-800">{tenancy.brandName}</span>
        <span className="truncate text-[11px] text-neutral-500">
          {tenancy.propertyName ?? "No property"}, {isoShortLabel(tenancy.startDate)} to{" "}
          {isoShortLabel(tenancy.endDate)}
        </span>
      </div>
    </div>
  );
}

function EventRow({ ev }: { ev: CalendarEvent }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-xs font-semibold text-neutral-800">{ev.title}</span>
        <span className="truncate text-[11px] text-neutral-500">
          {ev.propertyName ?? "No property"}
          {ev.trade ? ` (${ev.trade})` : ""}
          {ev.time ? ` , ${ev.time}` : ""}
        </span>
      </div>
      <span
        className={clsx(
          "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
          eventChip(ev)
        )}
      >
        {KIND_LABEL[ev.kind]}
      </span>
    </div>
  );
}

export function DayDrawer({
  dateIso,
  events,
  tenancies,
  colours,
  onClose
}: {
  dateIso: string | null;
  events: CalendarEvent[];
  tenancies: Tenancy[];
  colours: Map<string, PropertyColour>;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!dateIso) return null;

  // Group by kind, in the standard order, so the drawer reads predictably.
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    items: events.filter((e) => e.kind === kind)
  })).filter((g) => g.items.length > 0);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl animate-slide-in">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-neutral-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold text-neutral-900">
              {isoShortDow(dateIso)} {isoShortLabel(dateIso)}
            </h2>
            <p className="text-sm text-neutral-500">
              {tenancies.length} tenanc{tenancies.length === 1 ? "y" : "ies"},{" "}
              {events.length} event{events.length === 1 ? "" : "s"} across visible properties
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-4">
          {tenancies.length > 0 && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Tenancies ({tenancies.length})
              </h3>
              <div className="flex flex-col gap-2">
                {tenancies.map((t) => (
                  <TenancyRow
                    key={t.bookingId}
                    tenancy={t}
                    colour={propertyColour(colours, t.propertyId)}
                  />
                ))}
              </div>
            </section>
          )}
          {grouped.length === 0 && tenancies.length === 0 ? (
            <p className="text-xs italic text-neutral-400">Nothing scheduled for this day.</p>
          ) : (
            grouped.map((g) => (
              <section key={g.kind}>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  {KIND_LABEL[g.kind]} ({g.items.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {g.items.map((ev) => (
                    <EventRow key={ev.id} ev={ev} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
