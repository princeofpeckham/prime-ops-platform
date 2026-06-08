import { Badge } from "@/components/ui/Badge";
import { TRADE_LABEL } from "@/lib/vendors/status";
import type { VendorItem } from "@/lib/vendors/types";

function Stars({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, rating));
  return (
    <span className="tabular-nums text-amber-500" aria-label={`${clamped} out of 5`}>
      {"★".repeat(clamped)}
      <span className="text-neutral-300">{"★".repeat(5 - clamped)}</span>
    </span>
  );
}

export function VendorCard({ vendor }: { vendor: VendorItem }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-900">{vendor.name}</span>
        {vendor.isApproved ? (
          <Badge tone="good">Approved</Badge>
        ) : (
          <Badge tone="muted">Unvetted</Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge tone="neutral">{TRADE_LABEL[vendor.trade]}</Badge>
        {vendor.qualityRating != null ? (
          <Stars rating={vendor.qualityRating} />
        ) : (
          <span className="text-[11px] text-neutral-400">Not yet rated</span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span className="truncate">{vendor.coverageArea ?? "Coverage TBC"}</span>
        <span className="shrink-0 tabular-nums">
          {vendor.totalJobs} {vendor.totalJobs === 1 ? "job" : "jobs"}
        </span>
      </div>

      {vendor.contactName || vendor.contactEmail ? (
        <div className="mt-1 truncate rounded bg-neutral-50 px-2 py-1 text-[11px] text-neutral-600">
          {vendor.contactName ?? vendor.contactEmail}
        </div>
      ) : null}
    </div>
  );
}
