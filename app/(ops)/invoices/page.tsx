import Link from "next/link";
import { getInvoicesData } from "@/lib/invoices/data";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/invoices/types";
import { Badge } from "@/components/ui/Badge";
import { isoShortLabel, penceToGbp } from "@/lib/utils";

export const dynamic = "force-dynamic";

// "10 Jun 2026" style, matching the printed invoice.
function fullDateLabel(iso: string): string {
  return `${isoShortLabel(iso)} ${iso.slice(0, 4)}`;
}

export default async function InvoicesPage() {
  const data = await getInvoicesData();

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h1 className="text-xl font-semibold text-neutral-900">Invoices</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Deposit invoices issued to brands. {data.source === "mock" ? "Demo data." : "Live."}
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
        <span>
          <span className="font-semibold text-neutral-900">{data.items.length}</span> invoices
        </span>
        {data.issuedCount > 0 ? (
          <span>
            <span className="font-semibold text-neutral-900">{data.issuedCount}</span> awaiting payment
          </span>
        ) : null}
        <span>
          <span className="font-semibold text-neutral-900">{penceToGbp(data.totalIssuedPence)}</span>{" "}
          invoiced inc. VAT
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-2.5">Invoice</th>
              <th className="px-4 py-2.5">Property</th>
              <th className="px-4 py-2.5">Brand</th>
              <th className="px-4 py-2.5">Booking ref</th>
              <th className="px-4 py-2.5">Issued</th>
              <th className="px-4 py-2.5 text-right">Total inc. VAT</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">
                  No invoices yet. Create one from a deposit.
                </td>
              </tr>
            ) : (
              data.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${item.id}`}
                      className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                    >
                      {item.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{item.propertyName ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-neutral-700">{item.brandName ?? item.billedToName}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">{item.bookingRef ?? "None"}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {item.issuedDate ? fullDateLabel(item.issuedDate) : "Draft"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-neutral-900">
                    {penceToGbp(item.totalPence)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
