import { getCalendarData } from "@/lib/calendar/data";
import { londonToday } from "@/lib/utils";
import { CalendarView } from "@/components/calendar/CalendarView";
import { MaintenancePanel } from "@/components/calendar/MaintenancePanel";
import { NewMaintenanceModal } from "@/components/calendar/NewMaintenanceModal";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const data = await getCalendarData();
  const todayIso = londonToday();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Calendar</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Tenancies, viewings, cleans and maintenance across every property.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <NewMaintenanceModal properties={data.properties} />
      </section>

      {/* Two columns on lg+: property legend on the left, month grid on the
          right, with the maintenance panel below the grid. */}
      <CalendarView data={data} todayIso={todayIso}>
        <MaintenancePanel items={data.maintenance} />
      </CalendarView>
    </div>
  );
}
