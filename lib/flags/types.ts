import type { Enums } from "@/lib/supabase/types";

export type FlagStatus = Enums<"flag_status">;
export type FlagSeverity = Enums<"flag_severity">;
export type FlagSource = Enums<"flag_source">;
export type TradeType = Enums<"trade_type">;

// One flag, hydrated for the board card (property name, linked vendor job, photo count).
export type FlagItem = {
  id: string;
  propertyId: string;
  propertyName: string | null;
  title: string;
  description: string | null;
  trade: TradeType | null;
  severity: FlagSeverity;
  source: FlagSource;
  status: FlagStatus;
  photoCount: number;
  vendorJobId: string | null;
  assignedTo: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type FlagColumn = {
  status: FlagStatus;
  items: FlagItem[];
};

export type PropertyOption = { id: string; name: string };

// Approved vendors for the routing picker, grouped client-side by trade.
export type VendorOption = {
  id: string;
  name: string;
  trade: TradeType;
  coverageArea: string | null;
};

export type FlagsData = {
  columns: FlagColumn[];
  properties: PropertyOption[];
  vendors: VendorOption[];
  openCount: number;        // anything not resolved or dismissed
  urgentCount: number;      // open + severity urgent
  source: "supabase" | "mock";
  generatedAt: string;
};
