import { getAnalyticsData } from "@/lib/analytics/data";
import type { DepositSpaceRow } from "@/lib/analytics/types";
import { penceToGbp } from "@/lib/utils";
import { StatCard } from "@/components/analytics/StatCard";
import { ChartCard } from "@/components/analytics/ChartCard";
import { BarRow } from "@/components/analytics/BarRow";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { OccupancyChart } from "@/components/analytics/OccupancyChart";
import {
  BookingsTable,
  EnquiriesTable,
  PropertiesTable,
  ShiftsTable,
  VendorsTable
} from "@/components/analytics/DataTables";

export const dynamic = "force-dynamic";

// Per-space deposit tracker: a CSS bar of total deductions per property
// (relative to the biggest deductor) with held and refunded counts alongside.
function DepositsBySpace({ bySpace }: { bySpace: DepositSpaceRow[] }) {
  const maxDeducted = Math.max(1, ...bySpace.map((row) => row.deductedPence));
  return (
    <ChartCard title="Deposits by space" subtitle="Deductions, held and refunded">
      {bySpace.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-400">No deposits recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bySpace.map((row) => (
            <div key={row.propertyId} className="flex flex-col gap-0.5">
              <BarRow
                label={row.propertyName}
                pct={(row.deductedPence / maxDeducted) * 100}
                value={penceToGbp(row.deductedPence)}
                barClassName="bg-red-300"
              />
              <span className="pl-[7.75rem] text-[11px] text-neutral-500">
                {row.heldCount} held · {row.refundedCount} refunded
              </span>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  const m = data.metrics;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Analytics</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Pipeline, bookings and operations at a glance.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Open pipeline"
          value={penceToGbp(m.openPipelinePence)}
          hint={`${m.openEnquiries} open enquiries`}
        />
        <StatCard
          label="Bookings"
          value={String(m.bookingsCount)}
          hint="Confirmed and beyond"
        />
        <StatCard
          label="Total TTV"
          value={penceToGbp(m.totalTtvPence)}
          hint="Across all bookings"
        />
        <StatCard
          label="Shifts"
          value={`${m.shiftsCompleted} done`}
          hint={`${m.shiftsOpen} still open`}
        />
        <StatCard
          label="Vendors"
          value={String(m.vendorCount)}
          hint={`${m.approvedVendorCount} approved`}
        />
        <StatCard
          label="Properties"
          value={String(data.properties.length)}
          hint="In portfolio"
        />
        <StatCard
          label="Deducted this year"
          value={penceToGbp(data.deposits.totalDeductedThisYearPence)}
          hint="From deposits at checkout"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FunnelChart funnel={data.funnel} />
        <OccupancyChart occupancy={data.occupancy} windowStart={data.windowStart} />
      </section>

      <section>
        <DepositsBySpace bySpace={data.deposits.bySpace} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Bookings" subtitle={`${data.bookings.length} total`}>
          <BookingsTable rows={data.bookings} />
        </ChartCard>
        <ChartCard title="Enquiries" subtitle={`${data.enquiries.length} total`}>
          <EnquiriesTable rows={data.enquiries} />
        </ChartCard>
        <ChartCard title="Shifts" subtitle={`${data.shifts.length} total`}>
          <ShiftsTable rows={data.shifts} />
        </ChartCard>
        <ChartCard title="Vendors" subtitle={`${data.vendors.length} total`}>
          <VendorsTable rows={data.vendors} />
        </ChartCard>
        <ChartCard title="Properties" subtitle={`${data.properties.length} total`}>
          <PropertiesTable rows={data.properties} />
        </ChartCard>
      </section>
    </div>
  );
}
