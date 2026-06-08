import { penceToGbp, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { EnquiryItem } from "@/lib/inbox/types";

export function EnquiryCard({
  item,
  onOpen
}: {
  item: EnquiryItem;
  onOpen: () => void;
}) {
  const dates =
    item.requestedStartDate && item.requestedEndDate
      ? `${isoShortLabel(item.requestedStartDate)} to ${isoShortLabel(item.requestedEndDate)}`
      : item.requestedStartDate
        ? `from ${isoShortLabel(item.requestedStartDate)}`
        : "Dates TBC";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:border-neutral-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-900">{item.brandOrTenantName}</span>
        {item.needsReview ? <Badge tone="alert">Review</Badge> : null}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium tabular-nums text-neutral-800">
          {item.valuePence != null ? penceToGbp(item.valuePence) : "Value TBC"}
        </span>
        {item.bookingId ? <Badge tone="good">Booked</Badge> : null}
      </div>

      <div className="text-[11px] text-neutral-500">{dates}</div>

      <div className="flex items-center gap-1 text-[11px] text-neutral-500">
        <span className="truncate">{item.propertyName ?? item.requestedArea ?? "Space TBC"}</span>
      </div>

      {item.nextAction ? (
        <div className="mt-1 rounded bg-neutral-50 px-2 py-1 text-[11px] text-neutral-600">
          {item.nextAction}
        </div>
      ) : null}
    </button>
  );
}
