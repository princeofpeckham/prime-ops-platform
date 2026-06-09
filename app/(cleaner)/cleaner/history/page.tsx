import { getCleanerHistoryData } from "@/lib/cleaner/data";
import { Badge } from "@/components/ui/Badge";
import { isoShortDow, isoShortLabel, penceToGbp } from "@/lib/utils";
import { TYPE_LABEL } from "@/lib/cleaner/labels";

export const dynamic = "force-dynamic";

export default async function CleanerHistoryPage() {
  const data = await getCleanerHistoryData();

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-neutral-900">History</h1>
        <p className="text-xs text-neutral-500">
          Cleans you have completed. {data.source === "mock" ? "Demo data." : null}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Earned
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">
            {penceToGbp(data.totalEarnedPence)}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Cleans done
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">
            {data.completedCount}
          </div>
        </div>
      </section>

      {data.jobs.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">
          Nothing completed yet. Finished cleans will appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Completed cleans
          </span>
          {data.jobs.map((job) => (
            <article
              key={job.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-neutral-900">
                  {job.propertyName ?? "Space"}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {isoShortDow(job.date)} {isoShortLabel(job.date)} · {TYPE_LABEL[job.type]}
                  {job.brandName ? ` · ${job.brandName}` : ""}
                </span>
                {job.completionPhotos.length > 0 ? (
                  <span className="text-[11px] text-neutral-400">
                    {job.completionPhotos.length}{" "}
                    {job.completionPhotos.length === 1 ? "photo" : "photos"} on file
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold tabular-nums text-neutral-900">
                  {penceToGbp(job.ratePence)}
                </span>
                <Badge tone="good">Completed</Badge>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
