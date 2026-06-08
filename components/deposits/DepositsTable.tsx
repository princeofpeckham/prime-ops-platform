"use client";

import { useState } from "react";
import clsx from "clsx";
import { penceToGbp, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABEL, STATUS_TONE, countdownLabel, daysToDeadline, isClosed } from "@/lib/deposits/status";
import { DepositDrawer } from "./DepositDrawer";
import type { DepositItem, DepositsData } from "@/lib/deposits/types";

function Countdown({ item }: { item: DepositItem }) {
  if (isClosed(item.status)) {
    return <span className="text-[11px] text-neutral-400">Settled</span>;
  }
  const days = daysToDeadline(item.deadlineDate);
  const urgent = days <= 3;
  return (
    <span
      className={clsx(
        "text-[11px] font-medium tabular-nums",
        urgent ? "text-red-600" : "text-neutral-500"
      )}
    >
      {countdownLabel(days)}
    </span>
  );
}

export function DepositsTable({ data }: { data: DepositsData }) {
  const [selected, setSelected] = useState<DepositItem | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-2.5">Property</th>
              <th className="px-4 py-2.5">Brand</th>
              <th className="px-4 py-2.5">Checked out</th>
              <th className="px-4 py-2.5">Deadline</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Deduction</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">
                  No deposits to settle.
                </td>
              </tr>
            ) : (
              data.items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {item.propertyName ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{item.brandName ?? "Unknown"}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {isoShortLabel(item.checkoutDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="tabular-nums text-neutral-700">
                        {isoShortLabel(item.deadlineDate)}
                      </span>
                      <Countdown item={item} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-800">
                    {item.deductionAmountPence != null ? penceToGbp(item.deductionAmountPence) : "None"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DepositDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function DepositsSummary({ data }: { data: DepositsData }) {
  const open = data.items.filter((it) => !isClosed(it.status)).length;
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
      <span>
        <span className="font-semibold text-neutral-900">{open}</span> open deposits
      </span>
      {data.pendingReviewCount > 0 ? (
        <span>
          <span className="font-semibold text-neutral-900">{data.pendingReviewCount}</span> pending review
        </span>
      ) : null}
      {data.dueSoonCount > 0 ? (
        <span className="text-red-600">{data.dueSoonCount} due within 3 days</span>
      ) : null}
    </div>
  );
}
