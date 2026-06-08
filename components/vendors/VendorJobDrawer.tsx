"use client";

import { useState, useTransition } from "react";
import { penceToGbp, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABEL, STATUS_ORDER, TRADE_LABEL } from "@/lib/vendors/status";
import type { VendorJobItem, VendorJobStatus } from "@/lib/vendors/types";
import { updateVendorJob } from "@/app/(ops)/vendors/actions";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-800">{value}</span>
    </div>
  );
}

function poundsFromPence(pence: number | null): string {
  return pence == null ? "" : String(pence / 100);
}

function toPence(pounds: string): number | null {
  const s = pounds.trim();
  if (!s) return null;
  const n = Number(s);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function VendorJobDrawer({
  job,
  onClose
}: {
  job: VendorJobItem | null;
  onClose: () => void;
}) {
  return job ? <DrawerInner job={job} onClose={onClose} /> : null;
}

function DrawerInner({ job, onClose }: { job: VendorJobItem; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [quote, setQuote] = useState(poundsFromPence(job.quoteAmountPence));
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{job.title}</h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone="neutral">{STATUS_LABEL[job.status]}</Badge>
              <Badge tone="neutral">{TRADE_LABEL[job.trade]}</Badge>
              {job.chaseCount > 0 ? (
                <Badge tone="warn">
                  {job.chaseCount} {job.chaseCount === 1 ? "chase" : "chases"}
                </Badge>
              ) : null}
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </header>

        <div className="flex flex-col gap-5 p-5">
          <section className="rounded-lg border border-neutral-200 p-3">
            <Row label="Property" value={job.propertyName ?? "TBC"} />
            <Row label="Vendor" value={job.vendorName ?? "Unassigned"} />
            <Row label="Trade" value={TRADE_LABEL[job.trade]} />
            <Row label="Due" value={job.dueDate ? isoShortLabel(job.dueDate) : "No due date"} />
            <Row
              label="Quote"
              value={job.quoteAmountPence != null ? penceToGbp(job.quoteAmountPence) : "TBC"}
            />
            <Row
              label="Actual"
              value={job.actualAmountPence != null ? penceToGbp(job.actualAmountPence) : "TBC"}
            />
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</span>
            <select
              defaultValue={job.status}
              disabled={isPending}
              onChange={(e) =>
                startTransition(async () => {
                  await updateVendorJob(job.id, { status: e.target.value as VendorJobStatus });
                  setSaveMsg("Status updated.");
                })
              }
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Quote (GBP)</span>
            <div className="flex gap-2">
              <input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                type="number"
                min="0"
                step="1"
                placeholder="Quote amount"
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await updateVendorJob(job.id, { quote_amount_pence: toPence(quote) });
                    setSaveMsg("Quote saved.");
                  })
                }
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {saveMsg ? <span className="text-xs text-neutral-500">{saveMsg}</span> : null}
          </section>
        </div>
      </aside>
    </div>
  );
}
