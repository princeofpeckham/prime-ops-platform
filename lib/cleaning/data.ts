import type { CleaningData } from "./types";
import { generateMockCleaning } from "./mock";
import { fetchCleaningFromSupabase } from "./queries";

export async function getCleaningData(): Promise<CleaningData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockCleaning();
  }
  return fetchCleaningFromSupabase();
}
