"use client";

import Link from "next/link";

// Small toolbar above the print-ready invoice. Hidden when printing via the
// Tailwind print: variant; the page itself also hides the app chrome.
export function PrintToolbar() {
  return (
    <div className="mb-4 flex items-center justify-between print:hidden">
      <Link href="/invoices" className="text-sm text-neutral-600 hover:text-neutral-900">
        Back to invoices
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-prime-ink px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Print / save as PDF
      </button>
    </div>
  );
}
