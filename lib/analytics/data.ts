import type { AnalyticsData } from "./types";
import { generateMockAnalytics } from "./mock";
import { fetchAnalyticsFromSupabase } from "./queries";

export async function getAnalyticsData(): Promise<AnalyticsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockAnalytics();
  }
  return fetchAnalyticsFromSupabase();
}
