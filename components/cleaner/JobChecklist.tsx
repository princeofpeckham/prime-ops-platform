"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  BLANK_SLATE_CHECKLIST,
  BLANK_SLATE_STANDARD,
  CHECKLIST_TOTAL,
  TIMING_NOTES
} from "@/lib/cleaner/checklist";

// The blank slate checklist as tappable rows. State is in-memory only and
// resets every visit, exactly like the hub: it is a guide, not a saved form.
export function JobChecklist() {
  const [ticked, setTicked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setTicked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const doneCount = Object.values(ticked).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          What a clean space looks like
        </span>
        <span className="text-[11px] font-medium tabular-nums text-neutral-500">
          {doneCount} / {CHECKLIST_TOTAL}
        </span>
      </div>

      <p className="rounded-md bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-neutral-600">
        {BLANK_SLATE_STANDARD}
      </p>

      <div className="flex flex-col gap-3">
        {BLANK_SLATE_CHECKLIST.map((section) => (
          <div key={section.id} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              {section.title}
            </span>
            {section.items.map((item) => {
              const isOn = !!ticked[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={clsx(
                    "flex items-start gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition",
                    isOn
                      ? "border-emerald-200 bg-emerald-50 text-neutral-500"
                      : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                  )}
                  aria-pressed={isOn}
                >
                  <span
                    className={clsx(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold",
                      isOn
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-neutral-300 bg-white text-transparent"
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className={clsx(isOn && "line-through")}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-md border border-neutral-200 bg-white px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          Timing
        </span>
        {TIMING_NOTES.map((note) => (
          <p key={note} className="text-[11px] leading-relaxed text-neutral-600">
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}
