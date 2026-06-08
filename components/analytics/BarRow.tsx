import clsx from "clsx";

// One horizontal bar: a fixed-width label, a track with a coloured fill whose
// width is a percentage, and a right-aligned value. Pure CSS, no chart library.
// pct is clamped to 0..100; a tiny minimum width keeps non-zero bars visible.
export function BarRow({
  label,
  pct,
  value,
  barClassName = "bg-neutral-400"
}: {
  label: string;
  pct: number;
  value: string;
  barClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const width = clamped > 0 && clamped < 2 ? 2 : clamped;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-xs text-neutral-600">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={clsx("h-full rounded-full", barClassName)}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums text-neutral-800">
        {value}
      </span>
    </div>
  );
}
