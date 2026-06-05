export function TimelineLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-500">
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-5 rounded-full bg-emerald-500" />
        CI
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-5 rounded-full bg-amber-500" />
        CO
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-5 rounded-full bg-purple-500" />
        CI/CO
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
        BH gap
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
        Clean gap
      </span>
      <span className="inline-flex items-center gap-1">
        <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" className="text-red-500"><path d="M8 1a1 1 0 0 1 .894.553l6 12A1 1 0 0 1 14 15H2a1 1 0 0 1-.894-1.447l6-12A1 1 0 0 1 8 1z"/></svg>
        Damage
      </span>
    </div>
  );
}
