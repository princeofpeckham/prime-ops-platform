import type { CaptureData, MyReportsData } from "./types";
import { generateMockCapture, generateMockMyReports } from "./mock";
import { fetchCaptureFromSupabase, fetchMyReportsFromSupabase } from "./queries";

export async function getCaptureData(): Promise<CaptureData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockCapture();
  }
  return fetchCaptureFromSupabase();
}

export async function getMyReportsData(): Promise<MyReportsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockMyReports();
  }
  return fetchMyReportsFromSupabase();
}
