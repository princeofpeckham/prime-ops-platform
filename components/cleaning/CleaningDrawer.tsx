"use client";

import { useTransition } from "react";
import { penceToGbp, isoShortLabel, isoShortDow } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_LABEL,
  TYPE_TONE,
  canComplete,
  canDispatch
} from "@/lib/cleaning/stages";
import type { CleaningJobItem } from "@/lib/cleaning/types";
import { dispatchClean, markComplete } from "@/app/(ops)/cleaning/actions";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-800">{value}</span>
    </div>
  );
}

function stampLabel(iso: string): string {
  const date = iso.slice(0, 10);
  return `${isoShortDow(date)} ${isoShortLabel(date)}`;
}

export function CleaningDrawer({
  item,
  onClose
}: {
  item: CleaningJobItem | null;
  onClose: () => void;
}) {
  return item ? <DrawerInner item={item} onClose={onClose} /> : null;
}

function DrawerInner({ item, onClose }: { item: CleaningJobItem; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {item.propertyName ?? "Property TBC"}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={TYPE_TONE[item.type]}>{TYPE_LABEL[item.type]}</Badge>
              <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </header>

        <div className="flex flex-col gap-5 p-5">
          <section className="rounded-lg border border-neutral-200 p-3">
            <Row label="Date" value={`${isoShortDow(item.date)} ${isoShortLabel(item.date)}`} />
            <Row label="Time window" value={item.timeWindow ?? "TBC"} />
            <Row label="Type" value={TYPE_LABEL[item.type]} />
            <Row label="Rate" value={penceToGbp(item.ratePence)} />
            {item.smsSentAt ? <Row label="SMS sent" value={stampLabel(item.smsSentAt)} /> : null}
            {item.confirmedAt ? <Row label="Confirmed" value={stampLabel(item.confirmedAt)} /> : null}
            {item.completedAt ? <Row label="Completed" value={stampLabel(item.completedAt)} /> : null}
          </section>

          {item.notes ? (
            <section className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Notes</span>
              <p className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                {item.notes}
              </p>
            </section>
          ) : null}

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Actions</span>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={isPending || !canDispatch(item)}
                onClick={() => startTransition(async () => { await dispatchClean(item.id); })}
                className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
              >
                Dispatch cleaner
              </button>
              <button
                disabled={isPending || !canComplete(item)}
                onClick={() => startTransition(async () => { await markComplete(item.id); })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-40"
              >
                Mark complete
              </button>
            </div>
            {item.status === "completed" ? (
              <span className="text-xs text-neutral-400">This job is complete.</span>
            ) : item.status === "cancelled" ? (
              <span className="text-xs text-neutral-400">This job was cancelled.</span>
            ) : null}
          </section>
        </div>
      </aside>
    </div>
  );
}
