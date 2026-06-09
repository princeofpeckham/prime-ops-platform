import { getMarketplaceData } from "@/lib/bh-shifts/data";
import { ShiftMarketplace } from "@/components/bh/ShiftMarketplace";

export const dynamic = "force-dynamic";

export default async function BhShiftsPage() {
  const data = await getMarketplaceData();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Open shifts</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Pick up check ins, check outs and viewings across the PRIME spaces.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-neutral-600">
          <span>
            <span className="font-semibold text-neutral-900">{data.shifts.length}</span> open
          </span>
          {data.appliedCount > 0 ? (
            <span className="text-amber-700">{data.appliedCount} applied</span>
          ) : null}
        </div>
      </section>

      <ShiftMarketplace data={data} />
    </div>
  );
}
