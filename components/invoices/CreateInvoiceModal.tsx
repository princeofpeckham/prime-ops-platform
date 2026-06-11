"use client";

import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { penceToGbp } from "@/lib/utils";
import { computeTotals, lineAmountPence } from "@/lib/invoices/logic";
import type { LineItem } from "@/lib/invoices/logic";
import { createInvoice } from "@/app/(ops)/deposits/actions";

// Form-friendly draft of a line: quantity and rate held as strings so ops can
// type freely; converted to a LineItem for the preview and on submit.
type DraftLine = {
  item: string;
  quantity: string;
  rateGbp: string;
  waived: boolean;
};

const PRESETS: { label: string; ratePence: number }[] = [
  { label: "Standard Cleaning", ratePence: 15000 },
  { label: "Collection Services", ratePence: 12000 },
  { label: "Key Replacement", ratePence: 5000 },
  { label: "Late Checkout", ratePence: 10000 }
];

const EMPTY_LINE: DraftLine = { item: "", quantity: "1", rateGbp: "", waived: false };

function toLineItem(draft: DraftLine): LineItem {
  const quantity = Number(draft.quantity);
  const rate = Number(draft.rateGbp);
  return {
    item: draft.item.trim(),
    quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
    ratePence: Number.isFinite(rate) ? Math.max(0, Math.round(rate * 100)) : 0,
    waived: draft.waived
  };
}

export function CreateInvoiceModal({
  depositId,
  brandName,
  onClose,
  onCreated
}: {
  depositId: string;
  brandName: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [lines, setLines] = useState<DraftLine[]>([{ ...EMPTY_LINE }]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const items = useMemo(() => lines.map(toLineItem), [lines]);
  const validItems = useMemo(() => items.filter((it) => it.item.length > 0), [items]);
  const totals = useMemo(() => computeTotals(validItems), [validItems]);

  const updateLine = (index: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const removeLine = (index: number) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const addPreset = (preset: { label: string; ratePence: number }) => {
    const next: DraftLine = {
      item: preset.label,
      quantity: "1",
      rateGbp: String(preset.ratePence / 100),
      waived: false
    };
    setLines((prev) => {
      // Reuse a still-blank trailing row rather than stacking empties.
      const last = prev[prev.length - 1];
      if (last && last.item.trim() === "" && last.rateGbp.trim() === "") {
        return [...prev.slice(0, -1), next];
      }
      return [...prev, next];
    });
  };

  const submit = () => {
    setError(null);
    if (validItems.length === 0) {
      setError("Add at least one line item before issuing the invoice.");
      return;
    }
    startTransition(async () => {
      try {
        await createInvoice(depositId, validItems);
        onCreated();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create the invoice.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-full w-full max-w-lg flex-col overflow-y-auto rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Create invoice</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Billed to {brandName ?? "the brand"}. The next invoice number is claimed on issue.
            </p>
          </div>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </header>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addPreset(preset)}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                {preset.label} · {penceToGbp(preset.ratePence)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_4.5rem_5.5rem_3.5rem_2rem] gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              <span>Item</span>
              <span>Qty</span>
              <span>Rate (GBP)</span>
              <span>Waived</span>
              <span />
            </div>
            {lines.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_4.5rem_5.5rem_3.5rem_2rem] items-center gap-2"
              >
                <input
                  value={line.item}
                  onChange={(e) => updateLine(index, { item: e.target.value })}
                  placeholder="e.g. Standard Cleaning"
                  className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
                />
                <input
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: e.target.value })}
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm tabular-nums focus:border-neutral-900 focus:outline-none"
                />
                <input
                  value={line.rateGbp}
                  onChange={(e) => updateLine(index, { rateGbp: e.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm tabular-nums focus:border-neutral-900 focus:outline-none"
                />
                <label className="flex items-center justify-center">
                  <input
                    checked={line.waived}
                    onChange={(e) => updateLine(index, { waived: e.target.checked })}
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  disabled={lines.length === 1}
                  className="text-sm text-neutral-400 hover:text-red-600 disabled:opacity-30"
                  aria-label="Remove line"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, { ...EMPTY_LINE }])}
              className="self-start text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              + Add line
            </button>
          </div>

          <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex flex-col gap-1 text-sm">
              {validItems.map((item, i) => (
                <div key={i} className="flex justify-between gap-3 text-neutral-600">
                  <span className={clsx(item.waived && "line-through decoration-neutral-400")}>
                    {item.item} × {item.quantity}
                  </span>
                  <span className="tabular-nums">
                    {item.waived ? "WAIVED" : penceToGbp(lineAmountPence(item))}
                  </span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-neutral-200 pt-1.5 text-neutral-700">
                <span>Total</span>
                <span className="tabular-nums">{penceToGbp(totals.subtotalPence)}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>VAT (20%)</span>
                <span className="tabular-nums">{penceToGbp(totals.vatPence)}</span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-900">
                <span>Total inc. VAT</span>
                <span className="tabular-nums">{penceToGbp(totals.totalPence)}</span>
              </div>
            </div>
          </section>

          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <button
            disabled={isPending}
            onClick={submit}
            className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isPending ? "Issuing invoice" : "Issue invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
