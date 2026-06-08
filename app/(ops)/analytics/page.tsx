import { getAnalyticsData } from "@/lib/analytics/data";
import { penceToGbp } from "@/lib/utils";
import { StatCard } from "@/components/analytics/StatCard";
import { ChartCard } from "@/components/analytics/ChartCard";
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
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FunnelChart funnel={data.funnel} />
        <OccupancyChart occupancy={data.occupancy} windowStart={data.windowStart} />
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
