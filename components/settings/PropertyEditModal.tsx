"use client";

import { useState } from "react";
import { updateProperty } from "@/app/(ops)/settings/actions";
import { STATUS_LABEL } from "@/lib/settings/labels";
import type { PropertyConfig, PropertyStatus } from "@/lib/settings/types";

const STATUS_OPTIONS: PropertyStatus[] = ["active", "fit_out", "archived"];

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export function PropertyEditModal({ property }: { property: PropertyConfig }) {
  const [open, setOpen] = useState(false);
  const ratePounds = (property.cleaningRatePence / 100).toFixed(2);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
      >
        Edit
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative z-50 w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">Edit {property.name}</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              {property.address}
              {property.postcode ? `, ${property.postcode}` : ""}
            </p>

            <form
              action={async (fd) => {
                await updateProperty(fd);
                setOpen(false);
              }}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              <input type="hidden" name="id" value={property.id} />

              <Field label="Cleaning rate (GBP)">
                <input
                  name="cleaning_rate_pounds"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={ratePounds}
                  className={inputClass}
                />
              </Field>

              <Field label="Status">
                <select name="status" defaultValue={property.status} className={inputClass}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="col-span-2">
                <Field label="KeyNest instructions">
                  <textarea
                    name="keynest_instructions"
                    rows={3}
                    defaultValue={property.keynestInstructions ?? ""}
                    placeholder="Where and how to collect keys for this space"
                    className={inputClass}
                  />
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
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
