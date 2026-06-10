"use client";

import { useState } from "react";
import { createMaintenance } from "@/app/(ops)/calendar/actions";
import type { PropertyOption, TradeType } from "@/lib/calendar/types";

const TRADES: TradeType[] = [
  "signage",
  "blinds",
  "painting",
  "plumbing",
  "electrical",
  "cleaning",
  "security",
  "general"
];

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

export function NewMaintenanceModal({ properties }: { properties: PropertyOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        New maintenance
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative z-50 w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">New maintenance</h2>
            <form
              action={async (fd) => {
                await createMaintenance(fd);
                setOpen(false);
              }}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
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
              </div>
              <div className="col-span-2">
                <Field label="Title">
                  <input name="title" required className={inputClass} placeholder="e.g. Repaint scuffed wall" />
                </Field>
              </div>
              <Field label="Trade">
                <select name="trade" className={inputClass} defaultValue="">
                  <option value="">Unassigned</option>
                  {TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Scheduled date (optional)">
                <input name="scheduled_date" type="date" className={inputClass} />
              </Field>
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
