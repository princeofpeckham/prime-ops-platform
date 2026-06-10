import clsx from "clsx";
import { KIND_DOT, KIND_LABEL, KIND_ORDER } from "./vocabulary";

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-500">
      {KIND_ORDER.map((kind) => (
        <span key={kind} className="inline-flex items-center gap-1">
          <span className={clsx("inline-block h-3 w-5 rounded-full", KIND_DOT[kind])} />
          {KIND_LABEL[kind]}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-5 rounded-full bg-red-500" />
        Maintenance in progress
      </span>
    </div>
  );
}
