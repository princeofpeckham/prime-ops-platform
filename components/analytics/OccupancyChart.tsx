import { isoShortLabel, addDaysIso } from "@/lib/utils";
import type { OccupancyRow } from "@/lib/analytics/types";
import { ChartCard } from "./ChartCard";
import { BarRow } from "./BarRow";

// Occupancy proxy: share of the next 30 days that is booked, per property.
// Bars are absolute percentages (0..100), so the track length is meaningful.
export function OccupancyChart({
  occupancy,
  windowStart
}: {
  occupancy: OccupancyRow[];
  windowStart: string;
}) {
  const windowDays = occupancy[0]?.windowDays ?? 30;
  const windowEnd = addDaysIso(windowStart, windowDays - 1);
  const subtitle = `${isoShortLabel(windowStart)} to ${isoShortLabel(windowEnd)}`;

  return (
    <ChartCard title="Occupancy, next 30 days" subtitle={subtitle}>
      <div className="flex flex-col gap-2">
        {occupancy.map((row) => (
          <BarRow
            key={row.propertyId}
            label={row.propertyName}
            pct={row.occupancyPct}
            value={`${row.occupancyPct}%`}
            barClassName={row.tier === "prime" ? "bg-amber-400" : "bg-emerald-400"}
          />
        ))}
      </div>
    </ChartCard>
  );
}
