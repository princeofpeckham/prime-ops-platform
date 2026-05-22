import type { DashboardData } from "./types";
import { generateMockDashboard } from "./mock";
import { fetchDashboardFromSupabase } from "./queries";

export async function getDashboardData(): Promise<DashboardData> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    return generateMockDashboard();
  }
  return fetchDashboardFromSupabase();
}
