"use client";

import { useState } from "react";
import clsx from "clsx";
import { STATUS_ACCENT, STATUS_LABEL } from "@/lib/vendors/status";
import { VendorJobCard } from "./VendorJobCard";
import { VendorJobDrawer } from "./VendorJobDrawer";
import type { VendorJobColumn, VendorJobItem } from "@/lib/vendors/types";

export function JobsPipeline({ columns }: { columns: VendorJobColumn[] }) {
  const [selected, setSelected] = useState<VendorJobItem | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.status} className="flex w-72 shrink-0 flex-col">
            <div
              className={clsx(
                "flex items-center justify-between rounded-t-lg border-t-4 bg-white px-3 py-2",
                STATUS_ACCENT[col.status]
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                {STATUS_LABEL[col.status]}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-neutral-600">
                {col.items.length}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2 rounded-b-lg bg-neutral-100/60 p-2">
              {col.items.length === 0 ? (
                <span className="px-1 py-2 text-[11px] text-neutral-400">Nothing here.</span>
              ) : (
                col.items.map((job) => (
                  <VendorJobCard key={job.id} job={job} onOpen={() => setSelected(job)} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <VendorJobDrawer job={selected} onClose={() => setSelected(null)} />
    </>
  );
}
