// Stable per-property colours. Each property gets a hue from a fixed accessible
// palette of ten muted tones, assigned by index of the name-sorted property
// list, so the legend dot and the tenancy bars always agree.

import type { PropertyOption } from "@/lib/calendar/types";

export type PropertyColour = {
  dot: string;  // legend dot
  bar: string;  // tenancy bar fill (~85% opacity)
  dark: string; // darker accent for check-in / check-out edge markers
};

// Literal class strings so Tailwind's scanner picks every one up.
export const PROPERTY_PALETTE: PropertyColour[] = [
  { dot: "bg-emerald-500", bar: "bg-emerald-500/85", dark: "bg-emerald-700" },
  { dot: "bg-sky-500", bar: "bg-sky-500/85", dark: "bg-sky-700" },
  { dot: "bg-amber-500", bar: "bg-amber-500/85", dark: "bg-amber-700" },
  { dot: "bg-violet-500", bar: "bg-violet-500/85", dark: "bg-violet-700" },
  { dot: "bg-rose-500", bar: "bg-rose-500/85", dark: "bg-rose-700" },
  { dot: "bg-teal-500", bar: "bg-teal-500/85", dark: "bg-teal-700" },
  { dot: "bg-indigo-500", bar: "bg-indigo-500/85", dark: "bg-indigo-700" },
  { dot: "bg-lime-500", bar: "bg-lime-500/85", dark: "bg-lime-700" },
  { dot: "bg-orange-500", bar: "bg-orange-500/85", dark: "bg-orange-700" },
  { dot: "bg-cyan-500", bar: "bg-cyan-500/85", dark: "bg-cyan-700" }
];

const FALLBACK: PropertyColour = {
  dot: "bg-neutral-400",
  bar: "bg-neutral-400/85",
  dark: "bg-neutral-600"
};

// Map of property id -> colour, stable for a given property list.
export function buildPropertyColours(properties: PropertyOption[]): Map<string, PropertyColour> {
  const sorted = [...properties].sort((a, b) => a.name.localeCompare(b.name));
  const map = new Map<string, PropertyColour>();
  sorted.forEach((p, i) => {
    map.set(p.id, PROPERTY_PALETTE[i % PROPERTY_PALETTE.length] ?? FALLBACK);
  });
  return map;
}

export function propertyColour(
  colours: Map<string, PropertyColour>,
  propertyId: string | null
): PropertyColour {
  if (!propertyId) return FALLBACK;
  return colours.get(propertyId) ?? FALLBACK;
}
