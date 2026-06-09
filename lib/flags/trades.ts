// Human labels for the trade enum, shared by cards, the picker, and the new-flag form.

import type { TradeType } from "./types";

export const TRADE_ORDER: readonly TradeType[] = [
  "signage",
  "blinds",
  "painting",
  "plumbing",
  "electrical",
  "cleaning",
  "security",
  "general"
] as const;

export const TRADE_LABEL: Record<TradeType, string> = {
  signage: "Signage",
  blinds: "Blinds",
  painting: "Painting",
  plumbing: "Plumbing",
  electrical: "Electrical",
  cleaning: "Cleaning",
  security: "Security",
  general: "General"
};
