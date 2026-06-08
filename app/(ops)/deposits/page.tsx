import { getDepositsData } from "@/lib/deposits/data";
import { DepositsTable, DepositsSummary } from "@/components/deposits/DepositsTable";

export const dynamic = "force-dynamic";

export default async function DepositsPage() {
  const data = await getDepositsData();

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="text-xl font-semibold text-neutral-900">Deposits</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Settle each deposit before its refund deadline.{" "}
          {data.source === "mock" ? "Demo data." : "Live."}
        </p>
      </section>

      <DepositsSummary data={data} />

      <DepositsTable data={data} />
    </div>
  );
}
