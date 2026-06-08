import { getReportsData } from "@/lib/reports/data";
import { ReportsQueue, ReportsSummary } from "@/components/reports/ReportsQueue";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="text-xl font-semibold text-neutral-900">Condition reports</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Review queue for check in and check out reports.{" "}
          {data.source === "mock" ? "Demo data." : "Live."}
        </p>
      </section>

      <ReportsSummary data={data} />

      <ReportsQueue data={data} />
    </div>
  );
}
