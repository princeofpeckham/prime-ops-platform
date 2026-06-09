import type { CleanerHistoryData, CleanerJobsData } from "./types";
import { generateMockCleanerHistory, generateMockCleanerJobs } from "./mock";
import { fetchCleanerHistoryFromSupabase, fetchCleanerJobsFromSupabase } from "./queries";

export async function getCleanerJobsData(): Promise<CleanerJobsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockCleanerJobs();
  }
  return fetchCleanerJobsFromSupabase();
}

export async function getCleanerHistoryData(): Promise<CleanerHistoryData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockCleanerHistory();
  }
  return fetchCleanerHistoryFromSupabase();
}
