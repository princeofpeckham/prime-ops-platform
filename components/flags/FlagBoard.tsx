"use client";

import { useState } from "react";
import clsx from "clsx";
import { STATUS_ACCENT, STATUS_LABEL } from "@/lib/flags/statuses";
import { FlagCard } from "./FlagCard";
import { FlagDrawer } from "./FlagDrawer";
import type { FlagItem, FlagsData } from "@/lib/flags/types";

export function FlagBoard({ data }: { data: FlagsData }) {
  const [selected, setSelected] = useState<FlagItem | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {data.columns.map((col) => (
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
                col.items.map((item) => (
                  <FlagCard key={item.id} item={item} onOpen={() => setSelected(item)} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <FlagDrawer item={selected} vendors={data.vendors} onClose={() => setSelected(null)} />
    </>
  );
}

export function FlagsSummary({ data }: { data: FlagsData }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
      <span>
        <span className="font-semibold text-neutral-900">{data.openCount}</span> open flags
      </span>
      {data.urgentCount > 0 ? (
        <span className="text-red-600">{data.urgentCount} urgent</span>
      ) : null}
    </div>
  );
}
