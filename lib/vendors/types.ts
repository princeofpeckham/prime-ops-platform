import type { Tables, Enums } from "@/lib/supabase/types";

export type VendorRow = Tables<"vendors">;
export type VendorJobRow = Tables<"vendor_jobs">;
export type TradeType = Enums<"trade_type">;
export type VendorJobStatus = Enums<"vendor_job_status">;

// One vendor, shaped for the directory cards.
export type VendorItem = {
  id: string;
  name: string;
  trade: TradeType;
  qualityRating: number | null;
  isApproved: boolean;
  totalJobs: number;
  coverageArea: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

// One job, shaped for the pipeline cards.
export type VendorJobItem = {
  id: string;
  title: string;
  trade: TradeType;
  status: VendorJobStatus;
  propertyId: string;
  propertyName: string | null;
  vendorId: string | null;
  vendorName: string | null;
  quoteAmountPence: number | null;
  actualAmountPence: number | null;
  dueDate: string | null;
  chaseCount: number;
};

export type VendorJobColumn = {
  status: VendorJobStatus;
  items: VendorJobItem[];
};

export type PropertyOption = { id: string; name: string };

export type VendorsData = {
  vendors: VendorItem[];
  columns: VendorJobColumn[];
  properties: PropertyOption[];
  approvedCount: number;
  openJobCount: number;     // jobs not yet completed
  source: "supabase" | "mock";
  generatedAt: string;
};
