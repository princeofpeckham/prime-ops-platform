import { ReportRow } from "./ReportRow";
import type { ReportsData } from "@/lib/reports/types";

export function ReportsSummary({ data }: { data: ReportsData }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
      <span>
        <span className="font-semibold text-neutral-900">{data.items.length}</span> reports
      </span>
      <span>
        <span className="font-semibold tabular-nums text-neutral-900">{data.submittedCount}</span>{" "}
        awaiting review
      </span>
      {data.damageCount > 0 ? (
        <span className="text-red-600">{data.damageCount} with damage flags</span>
      ) : null}
    </div>
  );
}

export function ReportsQueue({ data }: { data: ReportsData }) {
  if (data.items.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
        No condition reports yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {data.items.map((item) => (
        <ReportRow key={item.id} item={item} />
      ))}
    </div>
  );
}
