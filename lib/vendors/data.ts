import type { VendorsData } from "./types";
import { generateMockVendors } from "./mock";
import { fetchVendorsFromSupabase } from "./queries";

export async function getVendorsData(): Promise<VendorsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockVendors();
  }
  return fetchVendorsFromSupabase();
}
