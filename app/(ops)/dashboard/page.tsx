import { getDashboardData } from "@/lib/dashboard/data";
import { RedFlagsStrip } from "@/components/dashboard/RedFlagsStrip";
import { TimelineGrid } from "@/components/dashboard/TimelineGrid";
import { TimelineLegend } from "@/components/dashboard/TimelineLegend";
import { PropertyHealthCard } from "@/components/dashboard/PropertyHealthCard";
import { DamageFlagsList } from "@/components/dashboard/DamageFlagsList";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { isoShortLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const windowEnd = data.days[data.days.length - 1];

  // PRIME-only health cards
  const primeHealth = data.health.filter((h) => h.property.tier === "prime");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Command Centre</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            {windowEnd ? (
              <>
                {isoShortLabel(data.windowStart)} to {isoShortLabel(windowEnd)} (London)
              </>
            ) : null}
          </p>
        </div>
        <div className="text-[10px] text-neutral-400">
          {data.source === "mock" ? "Demo data" : "Live"}
        </div>
      </section>

      {/* Red flags strip */}
      <RedFlagsStrip flags={data.flags} />

      {/* Timeline */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
            PRIME schedule
          </h2>
          <div className="flex items-center gap-3">
            <TimelineLegend />
            <ViewToggle />
          </div>
        </div>
        <TimelineGrid
          rows={data.primeRows}
          days={data.days}
          windowStart={data.windowStart}
          primeOnly
        />
      </section>

      {/* Damage flags overview */}
      {data.allDamageFlags.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
            Damage flags requiring action
          </h2>
          <DamageFlagsList flags={data.allDamageFlags} />
        </section>
      )}

      {/* Property health: PRIME only */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
          Property health
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {primeHealth.map((h) => (
            <PropertyHealthCard key={h.property.id} health={h} />
          ))}
        </div>
      </section>
    </div>
  );
}
