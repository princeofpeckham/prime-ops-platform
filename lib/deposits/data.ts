import type { DepositsData } from "./types";
import { generateMockDeposits } from "./mock";
import { fetchDepositsFromSupabase } from "./queries";

export async function getDepositsData(): Promise<DepositsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockDeposits();
  }
  return fetchDepositsFromSupabase();
}
