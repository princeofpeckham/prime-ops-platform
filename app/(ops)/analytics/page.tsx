import { getAnalyticsData } from "@/lib/analytics/data";
import type {
  DepositSpaceRow,
  OccupancyHistoryMonth,
  OccupancyHistorySpace
} from "@/lib/analytics/types";
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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Monthly TTV across all spaces for the current year. Always twelve bars,
// Jan..Dec, sized relative to the best month; zero months render as empty bars.
function MonthlyTtvChart({ monthly }: { monthly: OccupancyHistoryMonth[] }) {
  const maxTtv = Math.max(1, ...monthly.map((m) => m.ttvPence));
  return (
    <ChartCard title="Monthly TTV (this year)" subtitle="All spaces, from imported history">
      <div className="flex flex-col gap-2">
        {monthly.map((m) => (
          <BarRow
            key={m.month}
            label={MONTH_LABELS[Number(m.month.slice(5, 7)) - 1] ?? m.month}
            pct={(m.ttvPence / maxTtv) * 100}
            value={penceToGbp(m.ttvPence)}
            barClassName="bg-blue-400"
          />
        ))}
      </div>
    </ChartCard>
  );
}

// Year-to-date history per space: TTV bar relative to the best earner, with
// booked days, occupancy and average day rate alongside.
function OccupancyHistoryBySpace({ bySpace }: { bySpace: OccupancyHistorySpace[] }) {
  const maxTtv = Math.max(1, ...bySpace.map((row) => row.currentYearTtvPence));
  return (
    <ChartCard title="By space (this year)" subtitle="Booked days, occupancy, TTV and day rate">
      {bySpace.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-400">No space history recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bySpace.map((row) => (
            <div key={row.propertyId} className="flex flex-col gap-0.5">
              <BarRow
                label={row.name}
                pct={(row.currentYearTtvPence / maxTtv) * 100}
                value={penceToGbp(row.currentYearTtvPence)}
                barClassName="bg-emerald-400"
              />
              <span className="pl-[7.75rem] text-[11px] text-neutral-500">
                {row.currentYearBookedDays} booked days · {row.currentYearOccupancyPct}% occupancy ·{" "}
                {penceToGbp(row.avgDayRatePence)}/day
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

  const history = data.occupancyHistory;
  const yearTtvPence = history.bySpace.reduce((sum, row) => sum + row.currentYearTtvPence, 0);
  const yearBookedDays = history.bySpace.reduce((sum, row) => sum + row.currentYearBookedDays, 0);
  const bestDayRate = history.bySpace.reduce<OccupancyHistorySpace | null>(
    (best, row) => (row.avgDayRatePence > (best?.avgDayRatePence ?? 0) ? row : best),
    null
  );

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

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Occupancy history</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Imported per-month booked days and TTV per space.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="TTV this year"
            value={penceToGbp(yearTtvPence)}
            hint={`Across ${history.bySpace.length} spaces`}
          />
          <StatCard
            label="Booked days this year"
            value={String(yearBookedDays)}
            hint="Sum across all spaces"
          />
          <StatCard
            label="Best day rate"
            value={bestDayRate ? penceToGbp(bestDayRate.avgDayRatePence) : "No data"}
            hint={bestDayRate ? `${bestDayRate.name}, average per booked day` : "No history yet"}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MonthlyTtvChart monthly={history.monthly} />
          <OccupancyHistoryBySpace bySpace={history.bySpace} />
        </div>
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
