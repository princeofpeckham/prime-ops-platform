import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { isoShortLabel } from "@/lib/utils";
import {
  OVERALL_LABEL,
  OVERALL_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TYPE_LABEL
} from "@/lib/reports/labels";
import type { ReportItem } from "@/lib/reports/types";
import { ReviewButton } from "./ReviewButton";

function isoDateOnly(iso: string): string {
  return isoShortLabel(iso.slice(0, 10));
}

export function ReportRow({ item }: { item: ReportItem }) {
  const typeTone = item.type === "check_in" ? "neutral" : "accent";
  const when = item.submittedAt ?? item.createdAt;

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={typeTone}>{TYPE_LABEL[item.type]}</Badge>
          <span className="text-sm font-semibold text-neutral-900">
            {item.brandName ?? "Unknown brand"}
          </span>
          <span className="text-xs text-neutral-400">{item.propertyName ?? "Property TBC"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
          {item.overallCondition ? (
            <Badge tone={OVERALL_TONE[item.overallCondition]}>
              {OVERALL_LABEL[item.overallCondition]}
            </Badge>
          ) : null}
          {item.hasDamageFlags ? <Badge tone="alert">Damage flags</Badge> : null}
          <span className="text-[11px] text-neutral-400">
            {item.bookingRef ?? "No ref"} | {isoDateOnly(when)}
          </span>
        </div>
        {item.summary ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600">{item.summary}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
        <Link
          href={`/reports/compare/${item.bookingId}`}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Compare
        </Link>
        {item.status === "submitted" ? <ReviewButton id={item.id} /> : null}
      </div>
    </div>
  );
}
