import type { ShiftsData } from "./types";
import { generateMockShifts } from "./mock";
import { fetchShiftsFromSupabase } from "./queries";

export async function getShiftsData(): Promise<ShiftsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockShifts();
  }
  return fetchShiftsFromSupabase();
}
