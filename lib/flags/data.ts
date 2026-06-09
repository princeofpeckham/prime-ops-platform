import type { FlagsData } from "./types";
import { generateMockFlags } from "./mock";
import { fetchFlagsFromSupabase } from "./queries";

export async function getFlagsData(): Promise<FlagsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockFlags();
  }
  return fetchFlagsFromSupabase();
}
