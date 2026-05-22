import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "good" | "warn" | "alert" | "muted";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  accent:  "bg-amber-50 text-amber-800 border border-amber-200",
  good:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warn:    "bg-orange-50 text-orange-700 border border-orange-200",
  alert:   "bg-red-50 text-red-700 border border-red-200",
  muted:   "bg-neutral-100 text-neutral-500"
};

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
