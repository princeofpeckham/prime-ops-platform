// The blank slate checklist, adapted from the Cleaner Hub content into
// structured data so the portal can render tappable, in-memory checkboxes.
// Source copy: cleaner-hub/content/checklist.md. Kept short and plain, one
// idea per line, British spelling, no jargon.

import type { ChecklistSection } from "./types";

export const BLANK_SLATE_CHECKLIST: ChecklistSection[] = [
  {
    id: "every-space",
    title: "Every space, every time",
    items: [
      { id: "floors", label: "Floors swept and mopped, including back of house" },
      { id: "walls", label: "Walls wiped down, marks and scuffs removed" },
      { id: "surfaces", label: "All surfaces and shelving wiped clean" },
      { id: "steel", label: "Stainless steel wiped and buffed: rails, fixtures, kitchen units" },
      { id: "glass", label: "Glass cleaned with no streaks: windows, doors, mirrors" },
      { id: "rubbish", label: "All small rubbish bagged and removed, bins emptied" },
      { id: "dust", label: "Skirting, ledges and shelves dusted" },
      { id: "nothing-left", label: "Nothing left behind by the previous brand" },
      { id: "lock-up", label: "Lights off, alarm set, doors and shutters locked" },
      { id: "keys", label: "Keys returned to the KeyNest point" }
    ]
  },
  {
    id: "bathroom",
    title: "If the space has a bathroom",
    items: [
      { id: "wc", label: "Toilet, sink and floor cleaned" },
      { id: "bath-mirror", label: "Mirror wiped, no streaks" },
      { id: "restock", label: "Soap and paper restocked if supplied" }
    ]
  },
  {
    id: "kitchenette",
    title: "If the space has a kitchenette",
    items: [
      { id: "kitchen-surfaces", label: "Sink and worktops wiped down" },
      { id: "fridge", label: "Fridge emptied and wiped if used" },
      { id: "kitchen-bin", label: "Bin emptied" }
    ]
  }
];

// Shown above the checklist so the standard is clear before they start.
export const BLANK_SLATE_STANDARD =
  "The next brand should walk into a space that looks brand new: no dust, no marks on walls, no smudges on glass or steel, no rubbish, no smell. If something is damaged or cannot be cleaned, photograph it and report it, do not try to hide it.";

// Timing rule, always shown so it is unambiguous. Checkout is 5PM across all
// spaces and the brand is in until then.
export const TIMING_NOTES: string[] = [
  "On the checkout day, start cleaning after 5PM. The brand is in until then.",
  "On any later vacant day, clean whenever the KeyNest point is open."
];

// Count of every tickable line, used to show progress on a job card.
export const CHECKLIST_TOTAL = BLANK_SLATE_CHECKLIST.reduce(
  (n, section) => n + section.items.length,
  0
);
