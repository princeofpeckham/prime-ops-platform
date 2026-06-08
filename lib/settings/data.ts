import type { SettingsData } from "./types";
import { generateMockSettings } from "./mock";
import { fetchSettingsFromSupabase } from "./queries";

export async function getSettingsData(): Promise<SettingsData> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return generateMockSettings();
  }
  return fetchSettingsFromSupabase();
}
