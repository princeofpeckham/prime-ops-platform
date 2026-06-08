import { getShiftsData } from "@/lib/shifts/data";
import { ShiftsTable, ShiftsSummary } from "@/components/shifts/ShiftsTable";

export const dynamic = "force-dynamic";

export default async function ShiftsPage() {
  const data = await getShiftsData();

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="text-xl font-semibold text-neutral-900">Shifts</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Check ins, check outs and viewings across every space.{" "}
          {data.source === "mock" ? "Demo data." : "Live."}
        </p>
      </section>

      <ShiftsSummary data={data} />

      <ShiftsTable data={data} />
    </div>
  );
}
