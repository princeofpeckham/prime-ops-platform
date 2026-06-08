"use client";

import { useState, useTransition } from "react";
import { penceToGbp, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { STAGE_LABEL, STAGE_ORDER, canPromote } from "@/lib/inbox/stages";
import type { EnquiryItem, EnquiryStage } from "@/lib/inbox/types";
import { moveStage, addNote, promoteToBooking } from "@/app/(ops)/inbox/actions";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-800">{value}</span>
    </div>
  );
}

export function EnquiryDrawer({
  item,
  onClose
}: {
  item: EnquiryItem | null;
  onClose: () => void;
}) {
  return item ? <DrawerInner item={item} onClose={onClose} /> : null;
}

function DrawerInner({ item, onClose }: { item: EnquiryItem; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [promoteMsg, setPromoteMsg] = useState<string | null>(null);

  const dates =
    item.requestedStartDate && item.requestedEndDate
      ? `${isoShortLabel(item.requestedStartDate)} to ${isoShortLabel(item.requestedEndDate)}`
      : item.requestedStartDate
        ? `from ${isoShortLabel(item.requestedStartDate)}`
        : "TBC";

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{item.brandOrTenantName}</h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone="neutral">{STAGE_LABEL[item.stage]}</Badge>
              {item.needsReview ? <Badge tone="alert">Needs review</Badge> : null}
              {item.bookingId ? <Badge tone="good">Booked</Badge> : null}
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </header>

        <div className="flex flex-col gap-5 p-5">
          {item.summary ? <p className="text-sm text-neutral-700">{item.summary}</p> : null}

          <section className="rounded-lg border border-neutral-200 p-3">
            <Row label="Value" value={item.valuePence != null ? penceToGbp(item.valuePence) : "TBC"} />
            <Row label="Dates" value={dates} />
            <Row label="Space" value={item.propertyName ?? item.requestedArea ?? "TBC"} />
            <Row label="Source" value={item.source} />
            {item.contactEmail ? <Row label="Email" value={item.contactEmail} /> : null}
            {item.contactPhone ? <Row label="Phone" value={item.contactPhone} /> : null}
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Stage</span>
            <select
              defaultValue={item.stage}
              disabled={isPending}
              onChange={(e) =>
                startTransition(async () => {
                  await moveStage(item.id, e.target.value as EnquiryStage);
                })
              }
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            >
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </section>

          {canPromote(item) ? (
            <section className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <span className="text-sm font-medium text-amber-900">Ready to become a booking?</span>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await promoteToBooking(item.id);
                    setPromoteMsg(res.ok ? "Promoted to a booking." : res.message ?? "Could not promote");
                  })
                }
                className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                Promote to booking
              </button>
              {promoteMsg ? <span className="text-xs text-amber-900">{promoteMsg}</span> : null}
            </section>
          ) : null}

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Timeline</span>
            <div className="flex flex-col gap-2">
              {item.events.length === 0 ? (
                <span className="text-xs text-neutral-400">No activity yet.</span>
              ) : (
                item.events.map((ev) => (
                  <div key={ev.id} className="rounded border border-neutral-100 bg-neutral-50 px-2 py-1.5 text-xs text-neutral-700">
                    <span className="font-medium text-neutral-500">[{ev.kind}] </span>
                    {ev.body}
                  </div>
                ))
              )}
            </div>
            <div className="mt-1 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note"
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <button
                disabled={isPending || !note.trim()}
                onClick={() =>
                  startTransition(async () => {
                    await addNote(item.id, note);
                    setNote("");
                  })
                }
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
