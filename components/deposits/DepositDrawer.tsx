"use client";

import { useState, useTransition } from "react";
import { penceToGbp, isoShortLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABEL, STATUS_TONE, countdownLabel, daysToDeadline, isClosed } from "@/lib/deposits/status";
import type { DepositItem } from "@/lib/deposits/types";
import { proposeDeduction, approveDeposit, processDeposit } from "@/app/(ops)/deposits/actions";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-800">{value}</span>
    </div>
  );
}

export function DepositDrawer({
  item,
  onClose
}: {
  item: DepositItem | null;
  onClose: () => void;
}) {
  return item ? <DrawerInner item={item} onClose={onClose} /> : null;
}

function DrawerInner({ item, onClose }: { item: DepositItem; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(
    item.deductionAmountPence != null ? String(item.deductionAmountPence / 100) : ""
  );
  const [reason, setReason] = useState(item.deductionReason ?? "");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const days = daysToDeadline(item.deadlineDate);
  const overdueOrSoon = !isClosed(item.status) && days <= 3;
  const closed = isClosed(item.status);

  const canPropose = item.status === "pending_review" || item.status === "deduction_proposed";
  const canApprove = item.status === "deduction_proposed";
  const canProcess = item.status === "approved";
  const canInvoice = !closed;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{item.brandName ?? "Unknown brand"}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
              {!closed ? (
                <Badge tone={overdueOrSoon ? "alert" : "muted"}>{countdownLabel(days)}</Badge>
              ) : null}
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </header>

        <div className="flex flex-col gap-5 p-5">
          <section className="rounded-lg border border-neutral-200 p-3">
            <Row label="Property" value={item.propertyName ?? "Unknown"} />
            <Row label="Checked out" value={isoShortLabel(item.checkoutDate)} />
            <Row label="Refund deadline" value={isoShortLabel(item.deadlineDate)} />
            <Row
              label="Proposed deduction"
              value={item.deductionAmountPence != null ? penceToGbp(item.deductionAmountPence) : "None"}
            />
          </section>

          {item.deductionReason ? (
            <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Deduction reason
              </span>
              <p className="mt-1 text-sm text-neutral-700">{item.deductionReason}</p>
            </section>
          ) : null}

          {canPropose ? (
            <section className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Propose a deduction
              </span>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-neutral-500">Amount (GBP)</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-neutral-500">Reason</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="What is being deducted and why"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </label>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const pence = Math.round(Number(amount || "0") * 100);
                    await proposeDeduction(item.id, pence, reason);
                    onClose();
                  })
                }
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                {item.status === "deduction_proposed" ? "Update deduction" : "Propose deduction"}
              </button>
            </section>
          ) : null}

          {canInvoice ? (
            <section className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Deposit invoice
              </span>
              <p className="text-sm text-neutral-600">
                Build an itemised invoice for cleaning, collections or damage against this deposit.
              </p>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Create invoice
              </button>
            </section>
          ) : null}

          {canApprove ? (
            <section className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <span className="text-sm font-medium text-emerald-900">Approve this decision?</span>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await approveDeposit(item.id);
                    onClose();
                  })
                }
                className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                Approve deposit
              </button>
            </section>
          ) : null}

          {canProcess ? (
            <section className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <span className="text-sm font-medium text-neutral-800">Action the refund or deduction.</span>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await processDeposit(item.id);
                    onClose();
                  })
                }
                className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                Mark as processed
              </button>
            </section>
          ) : null}

          {closed ? (
            <section className="rounded-lg border border-neutral-200 p-3 text-sm text-neutral-600">
              {item.approvedAt ? <Row label="Approved" value={isoShortLabel(item.approvedAt.slice(0, 10))} /> : null}
              {item.processedAt ? <Row label="Settled" value={isoShortLabel(item.processedAt.slice(0, 10))} /> : null}
              <p className="pt-1 text-xs text-neutral-500">This deposit is settled, no further action needed.</p>
            </section>
          ) : null}
        </div>
      </aside>

      {showInvoiceModal ? (
        <CreateInvoiceModal
          depositId={item.id}
          brandName={item.brandName}
          onClose={() => setShowInvoiceModal(false)}
          onCreated={() => {
            setShowInvoiceModal(false);
            onClose();
          }}
        />
      ) : null}
    </div>
  );
}
