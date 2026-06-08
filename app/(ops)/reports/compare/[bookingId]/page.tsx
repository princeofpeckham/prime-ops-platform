import Link from "next/link";
import { getCompareData } from "@/lib/reports/data";
import { CompareView } from "@/components/reports/CompareView";

export const dynamic = "force-dynamic";

export default async function ReportComparePage({
  params
}: {
  params: { bookingId: string };
}) {
  const data = await getCompareData(params.bookingId);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-1">
        <Link href="/reports" className="text-xs text-neutral-500 hover:text-neutral-900">
          Back to reports
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900">
          {data.brandName ?? "Condition report"} compare
        </h1>
        <p className="text-xs text-neutral-500">
          {[data.propertyName, data.bookingRef].filter(Boolean).join(" | ") || "Side by side"}
          {". "}
          Check in against check out, aligned by area.{" "}
          {data.source === "mock" ? "Demo data." : "Live."}
        </p>
      </section>

      <CompareView data={data} />
    </div>
  );
}
