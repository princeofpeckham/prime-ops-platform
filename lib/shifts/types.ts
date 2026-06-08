import type { Tables, Enums } from "@/lib/supabase/types";

export type Shift = Tables<"shifts">;
export type ShiftStatus = Enums<"shift_status">;
export type ShiftType = Enums<"shift_type">;

// One shift, flattened for the table row and any detail view.
export type ShiftItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  propertyId: string;
  propertyName: string | null;
  type: ShiftType;
  brand: string | null;
  ratePence: number;
  status: ShiftStatus;
  assignedBhId: string | null;
  isAssigned: boolean;
  isEscalated: boolean;
};

export type PropertyOption = { id: string; name: string };

export type ShiftsData = {
  shifts: ShiftItem[];
  properties: PropertyOption[];
  openCount: number;
  escalatedCount: number;
  source: "supabase" | "mock";
  generatedAt: string;
};
