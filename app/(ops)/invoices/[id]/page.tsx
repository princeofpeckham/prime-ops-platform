import { notFound } from "next/navigation";
import { getInvoiceItem } from "@/lib/invoices/data";
import { lineAmountPence } from "@/lib/invoices/logic";
import { isoShortLabel, penceToGbp } from "@/lib/utils";
import { PrintToolbar } from "@/components/invoices/PrintToolbar";

export const dynamic = "force-dynamic";

// "10 Jun 2026" style, as on the real Appear Here invoice.
function fullDateLabel(iso: string): string {
  return `${isoShortLabel(iso)} ${iso.slice(0, 4)}`;
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const invoice = await getInvoiceItem(params.id);
  if (!invoice) notFound();

  const billedTo = [invoice.billedToName, invoice.billedToAddress].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* When printing, hide the app chrome around this page so only the
          invoice sheet itself lands on the PDF. */}
      <style>{`@media print {
        header { display: none !important; }
        main { padding: 0 !important; max-width: none !important; }
        body { background: white !important; }
      }`}</style>

      <PrintToolbar />

      <article className="rounded-lg border border-neutral-200 bg-white p-10 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-neutral-900">Invoice</h1>
          <p className="mt-2 text-sm font-semibold text-neutral-900">Appear Here</p>
          <p className="text-sm text-neutral-700">
            11-12 Great Sutton St, Floor 1, London EC1V 0BX
          </p>
        </header>

        <section className="mt-8 flex flex-col gap-1 text-sm text-neutral-800">
          <p>
            <span className="font-semibold">Billed to:</span> {billedTo}
          </p>
          <p>
            <span className="font-semibold">Invoice Number:</span> {invoice.invoiceNumber}
          </p>
          <p>
            <span className="font-semibold">Date Issued:</span>{" "}
            {invoice.issuedDate ? fullDateLabel(invoice.issuedDate) : "Not issued"}
          </p>
          <p>
            <span className="font-semibold">Booking Reference:</span> {invoice.bookingRef ?? "None"}
          </p>
        </section>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-900 text-left text-xs font-semibold uppercase tracking-wide text-neutral-900">
              <th className="py-2 pr-4">Item</th>
              <th className="py-2 pr-4">Quantity / Hours</th>
              <th className="py-2 pr-4">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((line, i) => (
              <tr key={i} className="border-b border-neutral-200">
                <td className="py-2.5 pr-4 text-neutral-900">{line.item}</td>
                <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{line.quantity}</td>
                <td className="py-2.5 pr-4 tabular-nums text-neutral-700">
                  {penceToGbp(line.ratePence)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-neutral-900">
                  {line.waived ? "WAIVED" : penceToGbp(lineAmountPence(line))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-6 ml-auto flex w-full max-w-xs flex-col gap-1 text-sm">
          <div className="flex justify-between text-neutral-800">
            <span>Total</span>
            <span className="tabular-nums">{penceToGbp(invoice.subtotalPence)}</span>
          </div>
          <div className="flex justify-between text-neutral-800">
            <span>VAT</span>
            <span className="tabular-nums">{penceToGbp(invoice.vatPence)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-900 pt-1.5 font-semibold text-neutral-900">
            <span>Total INC. VAT</span>
            <span className="tabular-nums">{penceToGbp(invoice.totalPence)}</span>
          </div>
        </section>

        {invoice.notes ? (
          <section className="mt-8 text-sm text-neutral-700">
            <p>{invoice.notes}</p>
          </section>
        ) : null}

        <footer className="mt-12 border-t border-neutral-200 pt-6 text-sm text-neutral-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-900">
            For bank transfers
          </p>
          <div className="mt-2 flex flex-col gap-0.5">
            <p>
              <span className="font-semibold">CLIENT NAME</span> Appear Here Limited
            </p>
            <p>
              <span className="font-semibold">ACCOUNT NUMBER</span> 08561796
            </p>
            <p>
              <span className="font-semibold">SORT CODE</span> 18-00-02
            </p>
          </div>
        </footer>
      </article>
    </div>
  );
}
