"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { isoShortLabel } from "@/lib/utils";
import { completeMaintenance, scheduleMaintenance } from "@/app/(ops)/calendar/actions";
import type { MaintenanceItem, MaintenanceStatus } from "@/lib/calendar/types";

const GROUPS: { status: MaintenanceStatus; label: string; tone: "alert" | "accent" | "warn" | "good" }[] = [
  { status: "unscheduled", label: "Unscheduled", tone: "alert" },
  { status: "scheduled", label: "Scheduled", tone: "accent" },
  { status: "in_progress", label: "In progress", tone: "warn" },
  { status: "completed", label: "Completed", tone: "good" }
];

function MaintenanceRow({ item }: { item: MaintenanceItem }) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState("");

  return (
    <div className="flex flex-col gap-2 rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-xs font-semibold text-neutral-800">{item.title}</span>
          <span className="truncate text-[11px] text-neutral-500">
            {item.propertyName ?? "No property"}
            {item.trade ? ` , ${item.trade}` : ""}
          </span>
          {item.description && (
            <span className="truncate text-[11px] text-neutral-400">{item.description}</span>
          )}
        </div>
        {item.scheduledDate && (
          <Badge tone="neutral">{isoShortLabel(item.scheduledDate)}</Badge>
        )}
      </div>

      {/* Actions vary by status. Completed rows are read-only. */}
      {item.status !== "completed" && (
        <div className="flex flex-wrap items-center gap-2">
          {item.status === "unscheduled" ? (
            <>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] focus:border-neutral-900 focus:outline-none"
              />
              <button
                type="button"
                disabled={!date || isPending}
                onClick={() =>
                  startTransition(async () => {
                    await scheduleMaintenance(item.id, date);
                  })
                }
                className="rounded bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-40"
              >
                Schedule
              </button>
            </>
          ) : null}
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await completeMaintenance(item.id);
              })
            }
            className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40"
          >
            Mark complete
          </button>
        </div>
      )}
    </div>
  );
}

export function MaintenancePanel({ items }: { items: MaintenanceItem[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Maintenance</h2>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {GROUPS.map((g) => {
          const groupItems = items.filter((i) => i.status === g.status);
          return (
            <section key={g.status}>
              <div className="mb-2 flex items-center gap-2">
                <Badge tone={g.tone}>{g.label}</Badge>
                <span className="text-[11px] tabular-nums text-neutral-400">{groupItems.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {groupItems.length === 0 ? (
                  <span className={clsx("text-[11px] italic text-neutral-400")}>Nothing here.</span>
                ) : (
                  groupItems.map((item) => <MaintenanceRow key={item.id} item={item} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
