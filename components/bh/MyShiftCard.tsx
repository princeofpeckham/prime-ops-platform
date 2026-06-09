import clsx from "clsx";
import { penceToGbp, isoShortLabel, isoShortDow } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { TYPE_LABEL, TYPE_TONE, shortTime } from "@/lib/bh-shifts/status";
import type { MyShiftItem } from "@/lib/bh-shifts/types";

export function MyShiftCard({ shift }: { shift: MyShiftItem }) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm",
        shift.isEscalated ? "border-red-200 bg-red-50/60" : "border-neutral-200"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-900">
            {isoShortLabel(shift.date)}
            <span className="ml-1.5 text-[11px] font-normal text-neutral-400">
              {isoShortDow(shift.date)}
            </span>
          </span>
          <span className="text-[11px] tabular-nums text-neutral-500">
            {shortTime(shift.startTime)} to {shortTime(shift.endTime)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge tone={TYPE_TONE[shift.type]}>{TYPE_LABEL[shift.type]}</Badge>
          {shift.isEscalated ? <Badge tone="alert">Urgent</Badge> : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-neutral-800">{shift.propertyName ?? "Unknown space"}</span>
        <span className="tabular-nums text-neutral-700">{penceToGbp(shift.ratePence)}</span>
      </div>

      {shift.brand ? (
        <div className="text-[11px] text-neutral-500">Brand: {shift.brand}</div>
      ) : null}

      <div className="mt-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          KeyNest and access
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-neutral-700">
          {shift.keynestInstructions ?? "No access notes on file. Check the space guide or ask Ops."}
        </p>
      </div>
    </div>
  );
}
