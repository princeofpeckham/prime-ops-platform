import { getCleanerJobsData } from "@/lib/cleaner/data";
import { getActiveOrgId } from "@/lib/auth/org";
import { JobCard } from "@/components/cleaner/JobCard";

export const dynamic = "force-dynamic";

export default async function CleanerJobsPage() {
  const [data, orgId] = await Promise.all([getCleanerJobsData(), getActiveOrgId()]);

  // In mock/preview there is no authenticated org; keep upload paths well
  // formed with a stable demo prefix.
  const uploadOrgId = orgId ?? "demo-org";

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-neutral-900">Your jobs</h1>
        <p className="text-xs text-neutral-500">
          {data.toConfirmCount > 0
            ? `${data.toConfirmCount} new ${data.toConfirmCount === 1 ? "job needs" : "jobs need"} confirming.`
            : "Everything assigned to you, soonest first."}{" "}
          {data.source === "mock" ? "Demo data." : null}
        </p>
      </section>

      {data.jobs.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">
          No jobs right now. New cleans will show up here when ops assigns them.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.jobs.map((job) => (
            <JobCard key={job.id} job={job} orgId={uploadOrgId} />
          ))}
        </div>
      )}
    </div>
  );
}
