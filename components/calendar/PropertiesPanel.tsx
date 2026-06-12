"use client";

import clsx from "clsx";
import type { PropertyOption } from "@/lib/calendar/types";
import type { PropertyColour } from "./colours";
import { propertyColour } from "./colours";

const TIER_HINT: Record<string, string> = {
  prime: "Prime",
  pro: "Pro",
  other: "Other"
};

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Toggle ${label}`}
      onClick={onClick}
      className={clsx(
        "relative h-4 w-7 shrink-0 rounded-full transition-colors",
        on ? "bg-neutral-900" : "bg-neutral-200"
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all",
          on ? "left-3.5" : "left-0.5"
        )}
      />
    </button>
  );
}

// The togglable property legend that sits to the left of the month grid.
// Hiding a property removes its tenancy bars and event chips from the calendar.
export function PropertiesPanel({
  properties,
  colours,
  hiddenIds,
  onToggle,
  onPrimeOnly,
  onShowAll
}: {
  properties: PropertyOption[];
  colours: Map<string, PropertyColour>;
  hiddenIds: ReadonlySet<string>;
  onToggle: (propertyId: string) => void;
  onPrimeOnly: () => void;
  onShowAll: () => void;
}) {
  const sorted = [...properties].sort((a, b) => a.name.localeCompare(b.name));
  const hasPrime = properties.some((p) => p.tier === "prime");

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-900">Properties</h2>
        <div className="flex items-center gap-1">
          {hasPrime && (
            <button
              type="button"
              onClick={onPrimeOnly}
              className="rounded-md border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              PRIME only
            </button>
          )}
          <button
            type="button"
            onClick={onShowAll}
            className="rounded-md border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            All
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {sorted.map((p) => {
          const visible = !hiddenIds.has(p.id);
          const colour = propertyColour(colours, p.id);
          return (
            <div
              key={p.id}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-opacity",
                !visible && "opacity-45"
              )}
            >
              <span className={clsx("h-2.5 w-2.5 shrink-0 rounded-full", colour.dot)} />
              <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">{p.name}</span>
              {p.tier && (
                <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                  {TIER_HINT[p.tier] ?? p.tier}
                </span>
              )}
              <Toggle on={visible} onClick={() => onToggle(p.id)} label={p.name} />
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-xs italic text-neutral-400">No properties yet.</p>
        )}
      </div>
    </div>
  );
}
