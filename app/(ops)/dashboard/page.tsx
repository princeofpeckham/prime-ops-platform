import { getDashboardData } from "@/lib/dashboard/data";
import { RedFlagsStrip } from "@/components/dashboard/RedFlagsStrip";
import { TimelineGrid } from "@/components/dashboard/TimelineGrid";
import { TimelineLegend } from "@/components/dashboard/TimelineLegend";
import { PropertyHealthCard } from "@/components/dashboard/PropertyHealthCard";
import { isoShortLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const windowEnd = data.days[data.days.length - 1];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Command Centre</h1>
          <p className="mt-1 text-sm text-neutral-500">
            14-day view across all properties.{" "}
            {windowEnd ? (
              <>
                {isoShortLabel(data.windowStart)} to {isoShortLabel(windowEnd)} (London).
              </>
            ) : null}
          </p>
        </div>
        <div className="text-xs text-neutral-400">
          Source: {data.source}
          {data.source === "mock" ? " (set NEXT_PUBLIC_USE_MOCK_DATA=false to use Supabase)" : ""}
        </div>
      </section>

      <RedFlagsStrip flags={data.flags} />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Timeline
          </h2>
          <TimelineLegend />
        </div>
        <TimelineGrid rows={data.rows} days={data.days} windowStart={data.windowStart} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
          Property health
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.health.map((h) => (
            <PropertyHealthCard key={h.property.id} health={h} />
          ))}
        </div>
      </section>
    </div>
  );
}
