"use client";

import { useState } from "react";
import { createEnquiry } from "@/app/(ops)/inbox/actions";
import type { PropertyOption } from "@/lib/inbox/types";

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

export function NewEnquiryModal({ properties }: { properties: PropertyOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        New enquiry
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative z-50 w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">New enquiry</h2>
            <form
              action={async (fd) => {
                await createEnquiry(fd);
                setOpen(false);
              }}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <Field label="Brand or tenant name">
                  <input name="brand_or_tenant_name" required className={inputClass} />
                </Field>
              </div>
              <Field label="Contact email">
                <input name="contact_email" type="email" className={inputClass} />
              </Field>
              <Field label="Contact phone">
                <input name="contact_phone" className={inputClass} />
              </Field>
              <Field label="Value (GBP)">
                <input name="value_pounds" type="number" min="0" step="1" className={inputClass} />
              </Field>
              <Field label="Property">
                <select name="property_id" className={inputClass} defaultValue="">
                  <option value="">No specific property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Requested start">
                <input name="requested_start_date" type="date" className={inputClass} />
              </Field>
              <Field label="Requested end">
                <input name="requested_end_date" type="date" className={inputClass} />
              </Field>
              <div className="col-span-2">
                <Field label="Area (if no property)">
                  <input name="requested_area" className={inputClass} placeholder="e.g. Soho" />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Summary">
                  <textarea name="summary" rows={2} className={inputClass} />
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
                  Create enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
