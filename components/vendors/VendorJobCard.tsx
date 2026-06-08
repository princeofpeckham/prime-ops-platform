import { penceToGbp, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { TRADE_LABEL } from "@/lib/vendors/status";
import type { VendorJobItem } from "@/lib/vendors/types";

export function VendorJobCard({
  job,
  onOpen
}: {
  job: VendorJobItem;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:border-neutral-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-900">{job.title}</span>
        {job.chaseCount > 0 ? (
          <Badge tone="warn">
            {job.chaseCount} {job.chaseCount === 1 ? "chase" : "chases"}
          </Badge>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Badge tone="neutral">{TRADE_LABEL[job.trade]}</Badge>
        <span className="truncate text-[11px] text-neutral-500">
          {job.propertyName ?? "Property TBC"}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium tabular-nums text-neutral-800">
          {job.actualAmountPence != null
            ? penceToGbp(job.actualAmountPence)
            : job.quoteAmountPence != null
              ? penceToGbp(job.quoteAmountPence)
              : "Quote TBC"}
        </span>
        <span className="text-[11px] text-neutral-500">
          {job.actualAmountPence != null ? "actual" : job.quoteAmountPence != null ? "quoted" : ""}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span className="truncate">{job.vendorName ?? "Unassigned"}</span>
        <span className="shrink-0">
          {job.dueDate ? `Due ${isoShortLabel(job.dueDate)}` : "No due date"}
        </span>
      </div>
    </button>
  );
}
