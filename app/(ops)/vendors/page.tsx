import { getVendorsData } from "@/lib/vendors/data";
import { VendorDirectory } from "@/components/vendors/VendorDirectory";
import { JobsPipeline } from "@/components/vendors/JobsPipeline";
import { NewVendorJobModal } from "@/components/vendors/NewVendorJobModal";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const data = await getVendorsData();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Vendors</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Your trade directory and the jobs pipeline across every property.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <NewVendorJobModal properties={data.properties} vendors={data.vendors} />
      </section>

      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
        <span>
          <span className="font-semibold text-neutral-900">{data.vendors.length}</span> vendors
        </span>
        <span>
          <span className="font-semibold text-neutral-900">{data.approvedCount}</span> approved
        </span>
        <span>
          <span className="font-semibold tabular-nums text-neutral-900">{data.openJobCount}</span> open jobs
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Directory</h2>
        <VendorDirectory vendors={data.vendors} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Jobs pipeline</h2>
        <JobsPipeline columns={data.columns} />
      </section>
    </div>
  );
}
