"use client";

import { useState } from "react";
import clsx from "clsx";
import { STAGE_ACCENT, STAGE_LABEL } from "@/lib/inbox/stages";
import { penceToGbp } from "@/lib/utils";
import { EnquiryCard } from "./EnquiryCard";
import { EnquiryDrawer } from "./EnquiryDrawer";
import type { EnquiryItem, InboxData } from "@/lib/inbox/types";

export function InboxBoard({ data }: { data: InboxData }) {
  const [selected, setSelected] = useState<EnquiryItem | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {data.columns.map((col) => (
          <div key={col.stage} className="flex w-72 shrink-0 flex-col">
            <div
              className={clsx(
                "flex items-center justify-between rounded-t-lg border-t-4 bg-white px-3 py-2",
                STAGE_ACCENT[col.stage]
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                {STAGE_LABEL[col.stage]}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-neutral-600">
                {col.items.length}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2 rounded-b-lg bg-neutral-100/60 p-2">
              {col.items.length === 0 ? (
                <span className="px-1 py-2 text-[11px] text-neutral-400">Nothing here.</span>
              ) : (
                col.items.map((item) => (
                  <EnquiryCard key={item.id} item={item} onOpen={() => setSelected(item)} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <EnquiryDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function InboxSummary({ data }: { data: InboxData }) {
  const open = data.columns
    .filter((c) => c.stage !== "lost")
    .reduce((n, c) => n + c.items.length, 0);
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
      <span>
        <span className="font-semibold text-neutral-900">{open}</span> open enquiries
      </span>
      <span>
        Pipeline value{" "}
        <span className="font-semibold tabular-nums text-neutral-900">
          {penceToGbp(data.totalValuePence)}
        </span>
      </span>
      {data.needsReviewCount > 0 ? (
        <span className="text-red-600">{data.needsReviewCount} need review</span>
      ) : null}
    </div>
  );
}
