import { getMyShiftsData } from "@/lib/bh-shifts/data";
import { MyShiftCard } from "@/components/bh/MyShiftCard";
import { EscalationGuidance } from "@/components/bh/EscalationGuidance";

export const dynamic = "force-dynamic";

export default async function BhMyShiftsPage() {
  const data = await getMyShiftsData();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">My shifts</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Your assigned shifts with the access notes you need on the day.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
        <span className="pt-1 text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">{data.upcomingCount}</span> upcoming
        </span>
      </section>

      {data.shifts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-200 bg-white px-3 py-10 text-center text-sm text-neutral-400">
          No shifts assigned to you yet. Apply for open shifts to get on the rota.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.shifts.map((s) => (
            <MyShiftCard key={s.id} shift={s} />
          ))}
        </div>
      )}

      <EscalationGuidance />
    </div>
  );
}
