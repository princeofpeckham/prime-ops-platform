import { getCleaningData } from "@/lib/cleaning/data";
import { CleaningBoard, CleaningSummary } from "@/components/cleaning/CleaningBoard";

export const dynamic = "force-dynamic";

export default async function CleaningPage() {
  const data = await getCleaningData();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Cleaning</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Turnovers and deep cleans across the estate.{" "}
            {data.source === "mock" ? "Demo data." : "Live."}
          </p>
        </div>
      </section>

      <CleaningSummary data={data} />

      <CleaningBoard data={data} />
    </div>
  );
}
