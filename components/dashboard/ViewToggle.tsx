"use client";

// Placeholder: will allow switching between PRIME-only and All Properties views.
// For now, the dashboard defaults to PRIME-only. Full toggle wires into URL params later.

export function ViewToggle() {
  return (
    <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-0.5 text-[10px]">
      <span className="rounded bg-neutral-900 px-2 py-0.5 font-medium text-white">
        PRIME
      </span>
      <span className="px-2 py-0.5 font-medium text-neutral-500 cursor-not-allowed" title="Coming soon">
        All
      </span>
    </div>
  );
}
