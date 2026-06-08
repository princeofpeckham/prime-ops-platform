import type { ReactNode } from "react";

// A single headline metric. Value is pre-formatted by the caller so this stays
// presentation only (money via penceToGbp, counts as plain numbers).
export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4">
      <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span className="mt-1 text-xl font-semibold tabular-nums text-neutral-900">
        {value}
      </span>
      {hint ? <span className="mt-0.5 text-[11px] text-neutral-500">{hint}</span> : null}
    </div>
  );
}
