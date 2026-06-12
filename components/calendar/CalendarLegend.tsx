import clsx from "clsx";
import { KIND_DOT, KIND_LABEL, KIND_ORDER } from "./vocabulary";

// Small event-kind legend card, shown beneath the properties panel. Reuses the
// platform colour vocabulary for the five event kinds plus the in-progress red.
export function CalendarLegend() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Key</h2>
      <div className="mt-3 flex flex-col gap-1.5 text-xs text-neutral-600">
        {KIND_ORDER.map((kind) => (
          <span key={kind} className="inline-flex items-center gap-2">
            <span className={clsx("inline-block h-2.5 w-2.5 rounded-full", KIND_DOT[kind])} />
            {KIND_LABEL[kind]}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          Maintenance in progress
        </span>
        <span className="mt-1 border-t border-neutral-100 pt-2 text-[11px] text-neutral-400">
          Tenancy bars use the property colour. The darker edge marks check-in
          (left) and check-out (right).
        </span>
      </div>
    </div>
  );
}
