import type { CompareData, ReportsData } from "./types";
import { generateMockCompare, generateMockReports } from "./mock";
import { fetchCompareFromSupabase, fetchReportsFromSupabase } from "./queries";

export async function getReportsData(): Promise<ReportsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockReports();
  }
  return fetchReportsFromSupabase();
}

export async function getCompareData(bookingId: string): Promise<CompareData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockCompare(bookingId);
  }
  return fetchCompareFromSupabase(bookingId);
}
