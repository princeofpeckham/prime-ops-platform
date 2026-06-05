"use client";

import { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { penceToGbp } from "@/lib/utils";
import type { EventDetail, ShiftDetail, CleanDetail, DamageFlag } from "@/lib/dashboard/types";

// -------------------------------------------------------
// Status helpers
// -------------------------------------------------------
function shiftStatusBadge(s: ShiftDetail) {
  if (s.status === "assigned" && s.assignedBhName) {
    return <Badge tone="good">{s.assignedBhName}</Badge>;
  }
  if (s.status === "applied") return <Badge tone="warn">Applied (unassigned)</Badge>;
  return <Badge tone="alert">Unassigned</Badge>;
}

function cleanStatusBadge(c: CleanDetail) {
  if (c.status === "confirmed" && c.assignedCleanerName) {
    return <Badge tone="good">{c.assignedCleanerName}</Badge>;
  }
  if (c.status === "dispatched") return <Badge tone="warn">Dispatched</Badge>;
  return <Badge tone="alert">Unconfirmed</Badge>;
}

function damageStatusBadge(d: DamageFlag) {
  if (!d.vendorJobId) return <Badge tone="alert">No vendor assigned</Badge>;
  const label = d.vendorJobStatus === "scheduled"
    ? "Scheduled"
    : d.vendorJobStatus === "in_progress"
      ? "In progress"
      : d.vendorJobStatus === "quoted"
        ? "Quoted"
        : d.vendorJobStatus === "approved"
          ? "Approved"
          : String(d.vendorJobStatus ?? "");
  return <Badge tone="warn">{d.vendorName ? `${d.vendorName}: ${label}` : label}</Badge>;
}

// -------------------------------------------------------
// Shift row
// -------------------------------------------------------
function ShiftRow({ shift }: { shift: ShiftDetail }) {
  const typeLabel = shift.type === "check_in" ? "Check-in" : "Check-out";
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-neutral-800">{typeLabel}</span>
        <span className="text-[11px] text-neutral-500">{shift.startTime} - {shift.endTime}</span>
      </div>
      <div className="flex items-center gap-2">
        {shiftStatusBadge(shift)}
        {shift.status === "open" && (
          <button
            type="button"
            className="rounded bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-neutral-700 transition-colors"
          >
            Assign BH
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Clean row
// -------------------------------------------------------
function CleanRow({ clean }: { clean: CleanDetail }) {
  const typeLabel = clean.type === "pre_clean" ? "Pre-clean" : clean.type === "post_clean" ? "Post-clean" : "Deep clean";
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-neutral-800">{typeLabel}</span>
        <span className="text-[11px] text-neutral-500">{clean.timeWindow ?? "TBC"}</span>
      </div>
      <div className="flex items-center gap-2">
        {cleanStatusBadge(clean)}
        {clean.status === "pending" && (
          <button
            type="button"
            className="rounded bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-neutral-700 transition-colors"
          >
            Dispatch
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Damage flag row
// -------------------------------------------------------
function DamageFlagRow({ flag }: { flag: DamageFlag }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-red-100 bg-red-50/50 px-3 py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-neutral-800">{flag.areaName}</span>
        <span className="text-[11px] text-neutral-500">
          {flag.notes ?? "No details"}
          {flag.tradeNeeded ? ` (${flag.tradeNeeded})` : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {damageStatusBadge(flag)}
        {!flag.vendorJobId && (
          <button
            type="button"
            className="rounded bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-500 transition-colors"
          >
            Schedule repair
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Main drawer
// -------------------------------------------------------
export function EventDrawer({
  detail,
  onClose
}: {
  detail: EventDetail;
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

  const eventLabel =
    detail.eventType === "checkin" ? "Check-in"
    : detail.eventType === "checkout" ? "Check-out"
    : "Check-in / Check-out";

  const ciShifts = detail.shifts.filter((s) => s.type === "check_in");
  const coShifts = detail.shifts.filter((s) => s.type === "check_out");
  const relevantShifts =
    detail.eventType === "checkin" ? ciShifts
    : detail.eventType === "checkout" ? coShifts
    : detail.shifts;

  const preCleans = detail.cleans.filter((c) => c.type === "pre_clean");
  const postCleans = detail.cleans.filter((c) => c.type === "post_clean");
  const relevantCleans =
    detail.eventType === "checkin" ? preCleans
    : detail.eventType === "checkout" ? postCleans
    : detail.cleans;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-neutral-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={clsx(
                "inline-block h-2.5 w-2.5 rounded-full",
                detail.eventType === "checkin" ? "bg-emerald-500" : detail.eventType === "checkout" ? "bg-amber-500" : "bg-purple-500"
              )} />
              <h2 className="text-lg font-semibold text-neutral-900">{eventLabel}</h2>
            </div>
            <p className="text-sm text-neutral-500">{detail.propertyName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-4">
          {/* Brand info */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Brand</h3>
            <div className="rounded-lg border border-neutral-200 bg-white p-3">
              <p className="text-sm font-semibold text-neutral-900">{detail.brandName}</p>
              <p className="mt-1 text-xs text-neutral-500">Ref: {detail.externalId}</p>
              <div className="mt-2 flex flex-col gap-1">
                {detail.brandEmail && (
                  <a href={`mailto:${detail.brandEmail}`} className="text-xs text-blue-600 hover:underline">
                    {detail.brandEmail}
                  </a>
                )}
                {detail.brandPhone && (
                  <a href={`tel:${detail.brandPhone}`} className="text-xs text-blue-600 hover:underline">
                    {detail.brandPhone}
                  </a>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                <span>CI: {detail.checkInDate}</span>
                <span>CO: {detail.checkOutDate}</span>
                <span>TTV: {penceToGbp(detail.ttvPence)}</span>
              </div>
            </div>
          </section>

          {/* Coverage: BH shifts */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Brand Host coverage
            </h3>
            <div className="flex flex-col gap-2">
              {relevantShifts.length > 0
                ? relevantShifts.map((s) => <ShiftRow key={s.id} shift={s} />)
                : <p className="text-xs text-neutral-400 italic">No shifts for this event</p>
              }
            </div>
          </section>

          {/* Cleaning */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Cleaning
            </h3>
            <div className="flex flex-col gap-2">
              {relevantCleans.length > 0
                ? relevantCleans.map((c) => <CleanRow key={c.id} clean={c} />)
                : <p className="text-xs text-neutral-400 italic">No cleans for this event</p>
              }
            </div>
          </section>

          {/* Damage flags */}
          {detail.damageFlags.length > 0 && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Damage flags ({detail.damageFlags.length})
              </h3>
              <div className="flex flex-col gap-2">
                {detail.damageFlags.map((d) => <DamageFlagRow key={d.id} flag={d} />)}
              </div>
            </section>
          )}

          {/* Quick actions */}
          <section className="border-t border-neutral-100 pt-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Send reminder SMS
              </button>
              <button
                type="button"
                className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                View condition report
              </button>
              <button
                type="button"
                className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Open booking
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
