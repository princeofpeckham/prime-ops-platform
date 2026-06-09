import { isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SEVERITY_LABEL, SEVERITY_TONE } from "@/lib/flags/statuses";
import { TRADE_LABEL } from "@/lib/flags/trades";
import type { FlagItem } from "@/lib/flags/types";

const SOURCE_LABEL: Record<FlagItem["source"], string> = {
  condition_report: "Condition report",
  cleaner: "Cleaner",
  brandhost: "Brand host",
  ops_manual: "Ops",
  system: "System"
};

export function FlagCard({ item, onOpen }: { item: FlagItem; onOpen: () => void }) {
  const createdIso = item.createdAt.slice(0, 10);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:border-neutral-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-900">{item.title}</span>
        <Badge tone={SEVERITY_TONE[item.severity]}>{SEVERITY_LABEL[item.severity]}</Badge>
      </div>

      <div className="text-[11px] text-neutral-500">{item.propertyName ?? "Unknown space"}</div>

      <div className="flex flex-wrap items-center gap-1.5">
        {item.trade ? <Badge tone="neutral">{TRADE_LABEL[item.trade]}</Badge> : null}
        {item.vendorJobId ? <Badge tone="accent">Vendor job</Badge> : null}
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span>{SOURCE_LABEL[item.source]}</span>
        <span className="tabular-nums">{isoShortLabel(createdIso)}</span>
      </div>

      {item.photoCount > 0 ? (
        <div className="text-[11px] text-neutral-400">
          {item.photoCount} {item.photoCount === 1 ? "photo" : "photos"}
        </div>
      ) : null}
    </button>
  );
}
