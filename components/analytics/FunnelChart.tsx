import { STAGE_BAR, STAGE_LABEL } from "@/lib/analytics/compute";
import type { FunnelStageStat } from "@/lib/analytics/types";
import { ChartCard } from "./ChartCard";
import { BarRow } from "./BarRow";

// Funnel conversion: enquiries per stage. Bars are scaled against the largest
// stage so the busiest stage fills the track and the rest read relative to it.
export function FunnelChart({ funnel }: { funnel: FunnelStageStat[] }) {
  const max = funnel.reduce((m, s) => Math.max(m, s.count), 0);
  const total = funnel.reduce((sum, s) => sum + s.count, 0);

  return (
    <ChartCard title="Funnel conversion" subtitle={`${total} enquiries`}>
      <div className="flex flex-col gap-2">
        {funnel.map((stat) => (
          <BarRow
            key={stat.stage}
            label={STAGE_LABEL[stat.stage]}
            pct={max === 0 ? 0 : (stat.count / max) * 100}
            value={String(stat.count)}
            barClassName={STAGE_BAR[stat.stage]}
          />
        ))}
      </div>
    </ChartCard>
  );
}
