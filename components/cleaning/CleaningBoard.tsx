"use client";

import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { penceToGbp, isoShortLabel, isoShortDow } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TONE,
  TYPE_LABEL,
  TYPE_TONE,
  canComplete,
  canDispatch
} from "@/lib/cleaning/stages";
import type { CleaningData, CleaningJobItem, CleaningJobStatus } from "@/lib/cleaning/types";
import { dispatchClean, markComplete } from "@/app/(ops)/cleaning/actions";
import { CleaningDrawer } from "./CleaningDrawer";

type Filter = CleaningJobStatus | "all";

export function CleaningBoard({ data }: { data: CleaningData }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<CleaningJobItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      all: data.jobs.length,
      pending: 0,
      dispatched: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    for (const job of data.jobs) map[job.status] += 1;
    return map;
  }, [data.jobs]);

  const visible = filter === "all" ? data.jobs : data.jobs.filter((j) => j.status === filter);

  const tabs: Filter[] = ["all", ...STATUS_ORDER];

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              filter === tab
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
            )}
          >
            {tab === "all" ? "All" : STATUS_LABEL[tab]}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[tab]}</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-[11px] uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-2 font-semibold">Date</th>
              <th className="px-4 py-2 font-semibold">Property</th>
              <th className="px-4 py-2 font-semibold">Type</th>
              <th className="px-4 py-2 font-semibold">Window</th>
              <th className="px-4 py-2 text-right font-semibold">Rate</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-neutral-400">
                  No cleaning jobs here.
                </td>
              </tr>
            ) : (
              visible.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => setSelected(job)}
                  className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-neutral-900">{isoShortLabel(job.date)}</span>
                    <span className="ml-1 text-[11px] text-neutral-400">{isoShortDow(job.date)}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-800">{job.propertyName ?? "TBC"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={TYPE_TONE[job.type]}>{TYPE_LABEL[job.type]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-neutral-500">{job.timeWindow ?? "TBC"}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-neutral-800">
                    {penceToGbp(job.ratePence)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[job.status]}>{STATUS_LABEL[job.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {canDispatch(job) ? (
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(async () => { await dispatchClean(job.id); })}
                        className="rounded-md bg-prime-ink px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
                      >
                        Dispatch
                      </button>
                    ) : canComplete(job) ? (
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(async () => { await markComplete(job.id); })}
                        className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-neutral-50 disabled:opacity-40"
                      >
                        Mark done
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-300">No action</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CleaningDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function CleaningSummary({ data }: { data: CleaningData }) {
  const upcoming = data.jobs.filter(
    (j) => j.status !== "completed" && j.status !== "cancelled"
  ).length;
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
      <span>
        <span className="font-semibold text-neutral-900">{upcoming}</span> jobs on the books
      </span>
      <span>
        Scheduled spend{" "}
        <span className="font-semibold tabular-nums text-neutral-900">
          {penceToGbp(data.totalRatePence)}
        </span>
      </span>
      {data.pendingCount > 0 ? (
        <span className="text-orange-600">{data.pendingCount} awaiting dispatch</span>
      ) : null}
    </div>
  );
}
