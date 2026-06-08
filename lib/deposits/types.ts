import type { Tables, Enums } from "@/lib/supabase/types";

export type Deposit = Tables<"deposits">;
export type DepositStatus = Enums<"deposit_status">;

// One deposit, hydrated with the brand and property labels the screen shows.
export type DepositItem = {
  id: string;
  bookingId: string;
  propertyId: string;
  propertyName: string | null;
  brandName: string | null;
  checkoutDate: string;
  deadlineDate: string;
  status: DepositStatus;
  deductionAmountPence: number | null;
  deductionReason: string | null;
  approvedAt: string | null;
  processedAt: string | null;
  createdAt: string;
};

export type DepositsData = {
  items: DepositItem[];
  pendingReviewCount: number;
  dueSoonCount: number;          // open deposits with a deadline 3 days out or overdue
  source: "supabase" | "mock";
  generatedAt: string;
};
