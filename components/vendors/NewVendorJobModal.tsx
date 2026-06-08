"use client";

import { useState } from "react";
import { createVendorJob } from "@/app/(ops)/vendors/actions";
import { TRADE_LABEL, TRADE_ORDER } from "@/lib/vendors/status";
import type { PropertyOption, VendorItem } from "@/lib/vendors/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";

export function NewVendorJobModal({
  properties,
  vendors
}: {
  properties: PropertyOption[];
  vendors: VendorItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        New job
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative z-50 w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">New job</h2>
            <form
              action={async (fd) => {
                await createVendorJob(fd);
                setOpen(false);
              }}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <Field label="Title">
                  <input name="title" required className={inputClass} placeholder="e.g. Fascia repaint" />
                </Field>
              </div>
              <Field label="Property">
                <select name="property_id" required className={inputClass} defaultValue="">
                  <option value="" disabled>
                    Select a property
                  </option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Trade">
                <select name="trade" required className={inputClass} defaultValue="general">
                  {TRADE_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {TRADE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Vendor">
                <select name="vendor_id" className={inputClass} defaultValue="">
                  <option value="">Unassigned</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quote (GBP)">
                <input name="quote_pounds" type="number" min="0" step="1" className={inputClass} />
              </Field>
              <div className="col-span-2">
                <Field label="Due date">
                  <input name="due_date" type="date" className={inputClass} />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Description">
                  <textarea name="description" rows={2} className={inputClass} />
                </Field>
              </div>
              <div className="col-span-2 mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Create job
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
