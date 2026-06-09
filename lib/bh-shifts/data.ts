import type { MarketplaceData, MyShiftsData } from "./types";
import { generateMockMarketplace, generateMockMyShifts } from "./mock";
import { fetchMarketplaceFromSupabase, fetchMyShiftsFromSupabase } from "./queries";

export async function getMarketplaceData(): Promise<MarketplaceData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockMarketplace();
  }
  return fetchMarketplaceFromSupabase();
}

export async function getMyShiftsData(): Promise<MyShiftsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockMyShifts();
  }
  return fetchMyShiftsFromSupabase();
}
