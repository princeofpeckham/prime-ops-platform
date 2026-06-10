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
            Check-ins, check-outs, viewings, cleans and maintenance across every property.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <NewMaintenanceModal properties={data.properties} />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <CalendarView data={data} todayIso={todayIso} />
        <MaintenancePanel items={data.maintenance} />
      </div>
    </div>
  );
}
