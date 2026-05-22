function Swatch({
  className,
  label
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
      <span className={`inline-block h-3 w-4 rounded-sm border ${className}`} />
      {label}
    </span>
  );
}

export function TimelineLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
      <Swatch className="bg-emerald-100 border-emerald-300" label="Check-in" />
      <Swatch className="bg-neutral-200 border-neutral-300" label="Occupied" />
      <Swatch className="bg-amber-100 border-amber-300" label="Check-out" />
      <Swatch className="bg-purple-100 border-purple-300" label="Same-day turnover" />
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        Unassigned shift
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
        Unconfirmed clean
      </span>
    </div>
  );
}
