import type { Tables, Enums } from "@/lib/supabase/types";

export type Shift = Tables<"shifts">;
export type ShiftType = Enums<"shift_type">;
export type ShiftApplicationStatus = Enums<"shift_application_status">;

// One open shift in the marketplace, flattened for the card.
// hasApplied reflects whether the signed in brand host already has a pending
// application against this shift, so the card can offer Withdraw instead of Apply.
export type OpenShiftItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  propertyId: string;
  propertyName: string | null;
  type: ShiftType;
  brand: string | null;
  ratePence: number;
  isEscalated: boolean;
  hasApplied: boolean;
};

// One shift assigned to the signed in brand host, with the space access notes
// they need on the day.
export type MyShiftItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  propertyId: string;
  propertyName: string | null;
  type: ShiftType;
  brand: string | null;
  ratePence: number;
  isEscalated: boolean;
  keynestInstructions: string | null;
};

export type MarketplaceData = {
  shifts: OpenShiftItem[];
  appliedCount: number;
  source: "supabase" | "mock";
  generatedAt: string;
};

export type MyShiftsData = {
  shifts: MyShiftItem[];
  upcomingCount: number;
  source: "supabase" | "mock";
  generatedAt: string;
};
